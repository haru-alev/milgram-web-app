const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const WARDEN_PROFILE_PATH = path.join(DATA_DIR, 'warden_profile.json');
const PRISONERS_PATH = path.join(DATA_DIR, 'prisoners.json');
const NOTES_PATH = path.join(DATA_DIR, 'warden_notes.json');
const SYSTEM_TEXT_PATH = path.join(DATA_DIR, 'system_text.json');
const SECRET_FILES_PATH = path.join(DATA_DIR, 'secret_files.json');
const VOTES_PATH = path.join(DATA_DIR, 'votes.json');

const readJSON = (filePath) => {
    if (!fs.existsSync(filePath)) return {};
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};


// Профиль надзирателя из джейсон
app.get('/api/warden-profile', (req, res) => {
    try {
        const data = readJSON(WARDEN_PROFILE_PATH);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Ошибка чтения профиля надзирателя" });
    }
});


// Данные всех заключенных
app.get('/api/prisoners', (req, res) => {
    try {
        const data = readJSON(PRISONERS_PATH);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Ошибка чтения базы заключенных" });
    }
});

// Тексты для терминала
app.get('/api/system-text', (req, res) => {
    try {
        const data = readJSON(SYSTEM_TEXT_PATH);
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Ошибка чтения системных текстов" });
    }
});

// История заметок по айди
app.get('/api/notes/:id', (req, res) => {
    try {
        const allNotes = readJSON(NOTES_PATH);
        res.json(allNotes[req.params.id] || []);
    } catch (e) {
        res.json([]);
    }
});

// Тексты секретных файлов
app.get('/api/secret-files', (req, res) => {
  res.json(require('./data/secret_files.json'));
});

// Голосование
app.get('/api/votes/:prisonerId', (req, res) => {
    try {
        const votes = readJSON(VOTES_PATH);
        res.json({ success: true, votes: votes[req.params.prisonerId] || [] });
    } catch (e) {
        res.json({ success: true, votes: [] });
    }
});


// Сохранение заметок
app.post('/api/save-full-note', (req, res) => {
    const { id, text, attributes } = req.body;
    
    if (!id || text === undefined) {
        return res.status(400).json({ error: "Неполные данные для сохранения" });
    }

    try {
        const timestamp = new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit' 
        });

        // Обновление в warden_notes.json (история заметок)
        let allNotes = readJSON(NOTES_PATH);
        if (!allNotes[id]) allNotes[id] = [];
        
        const newEntry = { text, attributes, timestamp };
        allNotes[id].unshift(newEntry);
        fs.writeFileSync(NOTES_PATH, JSON.stringify(allNotes, null, 2));

        // 2. Обновление в prisoners.json (профиль)
        let pData = readJSON(PRISONERS_PATH);
        
        // Для Эса (id 000)
        if (id === '000' && pData.es) {
            pData.es.notes_es = text;
            pData.es.attributes = attributes;
            fs.writeFileSync(PRISONERS_PATH, JSON.stringify(pData, null, 2));
            console.log(`>>> Обновлен Эс (${id})`);
        }
        // Для Джекалопа (id ---)
        else if (id === '---' && pData.guidan) {
            pData.guidan.notes_es = text;
            pData.guidan.attributes = attributes;
            fs.writeFileSync(PRISONERS_PATH, JSON.stringify(pData, null, 2));
            console.log(`>>> Обновлен Джекалоп (${id})`);
        }
        // Для обычных заключенных
        else {
            const pIndex = pData.prisoners?.findIndex(p => p.id === id);
            if (pIndex !== -1 && pIndex !== undefined) {
                pData.prisoners[pIndex].notes_es = text;
                pData.prisoners[pIndex].attributes = attributes;
                fs.writeFileSync(PRISONERS_PATH, JSON.stringify(pData, null, 2));
                console.log(`>>> Обновлен заключенный ${id}`);
            } else {
                console.log(`>>> Персонаж с id ${id} не найден в prisoners.json`);
            }
        }

        res.json({ success: true, entry: newEntry });

    } catch (e) {
        console.error("Ошибка при сохранении:", e);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});


// Сохранение нового голоса
app.post('/api/vote', (req, res) => {
    const { prisonerId, verdict, timestamp } = req.body;
    
    try {
        let votes = readJSON(VOTES_PATH);
        if (!votes[prisonerId]) votes[prisonerId] = [];
        votes[prisonerId].push({ verdict, timestamp });
        fs.writeFileSync(VOTES_PATH, JSON.stringify(votes, null, 2));
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: "Ошибка сохранения голоса" });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`\x1b[32m%s\x1b[0m`, `>>> MILGRAM SERVER RUNNING ON http://localhost:${PORT}`);
});