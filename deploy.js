const fs = require('fs');
const path = require('path');
const axios = require('axios');

const API_URL = 'https://d6c67fbef868.ngrok-free.app/api/deploy';
const TOKEN = 'SEU_TOKEN_AQUI'; // ← Seu amigo precisa te dar um token

async function deployFiles() {
    const projectPath = './Site-Regente-main';
    
    // Array de arquivos para enviar (priorize os importantes primeiro)
    const filesToUpload = [
        // Arquivos Laravel essenciais
        'artisan',
        'composer.json',
        'composer.lock',
        'package.json',
        'vite.config.js',
        '.env.example',
        
        // Pastas Laravel
        'app/**/*',
        'bootstrap/**/*',
        'config/**/*',
        'database/**/*',
        'public/**/*',
        'resources/**/*',
        'routes/**/*',
        'storage/**/*',
        
        // Seus arquivos frontend
        'cadastro.html',
        'inicio.html',
        'login.html',
        'post.html',
        'login.css',
        'style.css',
        'fotos/**/*'
    ];

    console.log('Iniciando deploy...');

    for (const filePattern of filesToUpload) {
        const files = getFilesByPattern(projectPath, filePattern);
        
        for (const file of files) {
            await uploadFile(file, projectPath);
        }
    }
}

function getFilesByPattern(basePath, pattern) {
    if (pattern.includes('**')) {
        // É uma pasta com subpastas
        const dirPath = path.join(basePath, pattern.split('**')[0]);
        return getAllFiles(dirPath);
    } else {
        // É um arquivo específico
        return [path.join(basePath, pattern)];
    }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });
    
    return arrayOfFiles;
}

async function uploadFile(filePath, basePath) {
    try {
        const relativePath = path.relative(basePath, filePath);
        const fileContent = fs.readFileSync(filePath);
        
        // Para arquivos texto, ler como string
        const isTextFile = /\.(html|css|js|php|json|txt|md)$/i.test(filePath);
        const content = isTextFile ? 
            fs.readFileSync(filePath, 'utf-8') : 
            fileContent.toString('base64');

        const response = await axios.post(API_URL, {
            path: relativePath,
            content: content,
            isBase64: !isTextFile
        }, {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ ${relativePath} - OK`);
        
    } catch (error) {
        console.error(`❌ Erro em ${filePath}:`, error.message);
    }
}

// Executar o deploy
deployFiles().catch(console.error);
