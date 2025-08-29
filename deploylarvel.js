const fs = require('fs');
const path = require('path');
const axios = require('axios');

class LaravelDeployer {
    constructor() {
        this.API_URL = 'https://URL-DO-AMIGO.ngrok-free.app';
        this.token = 'TOKEN-DO-DEPLOY';
        this.authToken = null; // Token de autenticação do usuário
    }

    setup(config) {
        this.API_URL = config.url;
        this.token = config.token;
    }

    // 1. PRIMEIRO: Fazer login no sistema
    async login(credentials) {
        try {
            console.log('🔐 Fazendo login...');
            const response = await axios.post(`${this.API_URL}/api/login`, credentials);
            
            this.authToken = response.data.token || response.data.access_token;
            console.log('✅ Login realizado! Token:', this.authToken ? 'Recebido' : 'Não encontrado');
            
            return true;
        } catch (error) {
            console.log('❌ Erro no login:', error.response?.data || error.message);
            return false;
        }
    }

    // 2. DEPOIS: Fazer deploy dos arquivos
    async deploy() {
        if (!this.authToken) {
            console.log('⚠️  Faça login primeiro!');
            return false;
        }

        console.log('🚀 Iniciando deploy com autenticação...');

        const files = this.getLaravelFiles();
        console.log(`📦 ${files.length} arquivos para enviar`);

        for (const file of files) {
            await this.sendFile(file);
        }
    }

    getLaravelFiles() {
        // Arquivos prioritários do Laravel
        return [
            // Configurações
            '.env.example', 'composer.json', 'package.json', 'artisan',
            
            // Frontend
            'cadastro.html', 'inicio.html', 'login.html', 'post.html',
            'login.css', 'style.css', 'CERF.jpg',
            
            // Pasta de fotos
            ...this.getPhotoFiles(),
            
            // Core Laravel (se existir)
            ...this.getBackendFiles()
        ].filter(file => fs.existsSync(file));
    }

    async sendFile(filePath) {
        try {
            const isTextFile = /\.(html|css|js|json|txt|md|php)$/i.test(filePath);
            let content;

            if (isTextFile) {
                content = fs.readFileSync(filePath, 'utf8');
            } else {
                const fileBuffer = fs.readFileSync(filePath);
                content = fileBuffer.toString('base64');
            }

            // Enviar com token de AUTENTICAÇÃO
            const response = await axios.post(`${this.API_URL}/api/deploy`, {
                path: filePath,
                content: content,
                isBase64: !isTextFile
            }, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`, // ← Token do USUÁRIO
                    'Deploy-Token': this.token, // ← Token do DEPLOY
                    'Content-Type': 'application/json'
                }
            });

            console.log(`✅ ${filePath}`);
            return true;

        } catch (error) {
            console.log(`❌ ${filePath} - ${error.response?.data?.message || error.message}`);
            return false;
        }
    }

    getPhotoFiles() {
        try {
            if (fs.existsSync('fotos')) {
                return fs.readdirSync('fotos')
                    .map(file => path.join('fotos', file));
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    getBackendFiles() {
        const files = [];
        if (fs.existsSync('back')) {
            this.findFilesInDir('back', files);
        }
        return files;
    }

    findFilesInDir(dir, fileList) {
        try {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    this.findFilesInDir(fullPath, fileList);
                } else if (!item.startsWith('.')) {
                    fileList.push(fullPath);
                }
            });
        } catch (error) {
            console.log('Erro ao ler:', dir);
        }
    }
}

// 👇 USO CORRETO AGORA 👇
const deployer = new LaravelDeployer();

// 1. Primeiro configurar com dados do amigo
deployer.setup({
    url: 'https://NOVA-URL.ngrok-free.app',
    token: 'TOKEN-DEPLOY-DO-AMIGO'
});

// 2. Depois fazer LOGIN no sistema
async function executeDeploy() {
    const loggedIn = await deployer.login({
        email: 'seu-email@exemplo.com',
        password: 'sua-senha'
    });

    if (loggedIn) {
        // 3. Só então fazer deploy
        await deployer.deploy();
    } else {
        console.log('❌ Não foi possível fazer login. Verifique credenciais.');
    }
}

// executeDeploy(); // Descomente quando tiver os dados
