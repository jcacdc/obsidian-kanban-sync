"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
    kanbanFiles: ['Presupuestos Kanban'],
    estadoField: 'estado',
    syncDelay: 100
};
class KanbanSyncPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = DEFAULT_SETTINGS;
        this.syncTimeout = null;
    }
    async onload() {
        await this.loadSettings();
        this.addSettingTab(new KanbanSyncSettingTab(this.app, this));
        this.registerEvent(this.app.vault.on('modify', async (file) => {
            if (file instanceof obsidian_1.TFile) {
                const fileName = file.name.replace('.md', '');
                if (this.settings.kanbanFiles.includes(fileName)) {
                    if (this.syncTimeout) {
                        clearTimeout(this.syncTimeout);
                    }
                    this.syncTimeout = setTimeout(() => {
                        this.syncKanbanToNotes(fileName);
                    }, this.settings.syncDelay);
                }
            }
        }));
    }
    onunload() {
        if (this.syncTimeout) {
            clearTimeout(this.syncTimeout);
        }
        console.log('Kanban Sync plugin unloaded');
    }
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    async syncKanbanToNotes(kanbanFileName) {
        try {
            const kanbanFile = this.app.vault.getAbstractFileByPath(`${kanbanFileName}.md`);
            if (!kanbanFile || !(kanbanFile instanceof obsidian_1.TFile)) {
                return;
            }
            const content = await this.app.vault.read(kanbanFile);
            const estadoField = this.settings.estadoField;
            const sections = this.parseKanbanSections(content);
            for (const [estado, notas] of Object.entries(sections)) {
                for (const nota of notas) {
                    await this.updateNoteEstado(nota, estado, estadoField);
                }
            }
            new obsidian_1.Notice(`Kanban Sync: ${kanbanFileName} actualizado`);
        }
        catch (error) {
            console.error('Kanban Sync Error:', error);
        }
    }
    parseKanbanSections(content) {
        const sections = {};
        const lines = content.split('\n');
        let currentSection = '';
        const linkRegex = /\[\[([^\]]+)\]\]/g;
        for (const line of lines) {
            const sectionMatch = line.match(/^##\s+(.+)$/);
            if (sectionMatch) {
                currentSection = sectionMatch[1].trim().toUpperCase();
                if (!sections[currentSection]) {
                    sections[currentSection] = [];
                }
                continue;
            }
            if (currentSection && linkRegex.test(line)) {
                linkRegex.lastIndex = 0;
                let match;
                while ((match = linkRegex.exec(line)) !== null) {
                    const notaNombre = match[1];
                    if (!sections[currentSection].includes(notaNombre)) {
                        sections[currentSection].push(notaNombre);
                    }
                }
            }
        }
        return sections;
    }
    async updateNoteEstado(notaNombre, estado, estadoField) {
        try {
            const files = this.app.vault.getMarkdownFiles();
            const notaFile = files.find(f => f.basename === notaNombre);
            if (!notaFile) {
                return;
            }
            const content = await this.app.vault.read(notaFile);
            const lines = content.split('\n');
            let frontmatterStart = -1;
            let frontmatterEnd = -1;
            let estadoUpdated = false;
            if (lines[0] === '---') {
                frontmatterStart = 0;
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i] === '---') {
                        frontmatterEnd = i;
                        break;
                    }
                }
            }
            if (frontmatterStart !== -1 && frontmatterEnd !== -1) {
                for (let i = frontmatterStart + 1; i < frontmatterEnd; i++) {
                    const line = lines[i];
                    const fieldMatch = line.match(/^(\s*)(\w+):\s*(.*)$/);
                    if (fieldMatch && fieldMatch[2] === estadoField) {
                        const indent = fieldMatch[1];
                        const hasQuotes = fieldMatch[3].trim().startsWith('"') && fieldMatch[3].trim().endsWith('"');
                        if (hasQuotes) {
                            lines[i] = `${indent}${estadoField}: "${estado}"`;
                        }
                        else {
                            lines[i] = `${indent}${estadoField}: ${estado}`;
                        }
                        estadoUpdated = true;
                        break;
                    }
                }
            }
            if (estadoUpdated) {
                const newContent = lines.join('\n');
                await this.app.vault.modify(notaFile, newContent);
            }
        }
        catch (error) {
            console.error(`Error updating ${notaNombre}:`, error);
        }
    }
}
exports.default = KanbanSyncPlugin;
class KanbanSyncSettingTab extends obsidian_1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        new obsidian_1.Setting(containerEl)
            .setName('Archivos Kanban')
            .setDesc('Lista de archivos Kanban a monitorear (separados por coma)')
            .addText(text => text
            .setValue(this.plugin.settings.kanbanFiles.join(', '))
            .onChange(async (value) => {
            this.plugin.settings.kanbanFiles = value.split(',').map(s => s.trim()).filter(s => s);
            await this.plugin.saveSettings();
        }));
        new obsidian_1.Setting(containerEl)
            .setName('Campo de estado')
            .setDesc('Nombre del campo frontmatter a actualizar')
            .addText(text => text
            .setValue(this.plugin.settings.estadoField)
            .onChange(async (value) => {
            this.plugin.settings.estadoField = value;
            await this.plugin.saveSettings();
        }));
        new obsidian_1.Setting(containerEl)
            .setName('Delay de sincronizacion')
            .setDesc('Milisegundos de espera antes de sincronizar')
            .addText(text => text
            .setValue(String(this.plugin.settings.syncDelay))
            .onChange(async (value) => {
            this.plugin.settings.syncDelay = parseInt(value) || 100;
            await this.plugin.saveSettings();
        }));
    }
}
