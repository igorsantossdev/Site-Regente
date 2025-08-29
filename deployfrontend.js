const fs = require('fs');
const path = require('path');
const axios = require('axios');

class FrontendDeployer {
    constructor() {
        this.API_URL = 'https://URL-DO-SEU-AMIGO.ngrok-free.app';
        this.token = 'SEU-TOKEN-AQUI';
    }

    // Configurar com dados do amigo
    setup(config) {
        this.API_URL = config.url;
        this.token = config.token;
        console.log('✅ Configurado para:', this.API_URL);
    }

    // Lista de arquivos para deploy (prioridade frontend)
    getFrontendFiles() {
        return [
            // HTML Pages
            'cadastro.html',
            'inicio.html', 
            'login.html',
            'post.html',
            
            // CSS Files
            'login.css',
            'style.css',
            
            // Images
            'CERF.jpg',
            
            // README
            'README.md'
        ];
    }

    // Arquivos da pasta fotos
    getPhotoFiles() {
        try {
            if (fs.existsSync('fotos')) {
                return fs.readdirSync('fotos')
                    .filter(file => !file.startsWith('.'))
                    .map(file => path.join('fotos', file));
            }
            return [];
        } catch (error) {
            console.log('❌ Erro ao ler pasta fotos:', error.message);
            return [];
        }
    }

    // Arquivos do back (se existirem)
    getBackendFiles() {
        const backendFiles = [];
        
        if (fs.existsSync('back')) {
            this.findFilesInDir('back', backendFiles);
        }
        
        return backendFiles;
    }

    findFilesInDir(dir, fileList = []) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    this.findFilesInDir(fullPath, fileList);
                } else {
                    // Ignorar node_modules e arquivos desnecessários
                    if (!fullPath.includes('node_modules') && 
                        !fullPath.includes('vendor') &&
                        !file.startsWith('.')) {
                        fileList.push(fullPath);
                    }
                }
            });
        } catch (error) {
            console.log('❌ Erro ao ler:', dir, error.message);
        }
    }

    // Fazer deploy completo
    async deploy() {
        console.log('🚀 INICIANDO DEPLOY...\n');
        
        const allFiles = [
            ...this.getFrontendFiles(),
            ...this.getPhotoFiles(),
            ...this.getBackendFiles()
        ];

        console.log(`📦 ${allFiles.length} arquivos para enviar:\n`);

        let successCount = 0;
        let errorCount = 0;

        for (const file of allFiles) {
            if (fs.existsSync(file)) {
                const success = await this.sendFile(file);
                if (success) successCount++;
                else errorCount++;
            } else {
                console.log(`❌ ${file} - Arquivo não encontrado`);
                errorCount++;
            }
        }

        console.log('\n📊 RESULTADO:');
        console.log(`✅ ${successCount} arquivos enviados com sucesso`);
        console.log(`❌ ${errorCount} arquivos com erro`);
        console.log('🎉 Deploy concluído!');
    }

    // Enviar arquivo individual
    async sendFile(filePath) {
        try {
            // Verificar se é arquivo de texto ou binário
            const isTextFile = /\.(html|css|js|json|txt|md|php)$/i.test(filePath);
            
            let content;
            if (isTextFile) {
                content = fs.readFileSync(filePath, 'utf8');
            } else {
                // Arquivos binários (imagens) em base64
                const fileBuffer = fs.readFileSync(filePath);
                content = fileBuffer.toString('base64');
            }

            const response = await axios.post(`${this.API_URL}/api/deploy`, {
                path: filePath,
                content: content,
                isBase64: !isTextFile,
                filename: path.basename(filePath)
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000 // 10 segundos timeout
            });

            console.log(`✅ ${filePath}`);
            return true;

        } catch (error) {
            console.log(`❌ ${filePath} - ${error.message}`);
            return false;
        }
    }
}

// USO: Quando seu amigo passar os dados
const deployer = new FrontendDeployer();

// EXEMPLO de como configurar depois:
// deployer.setup({
//     url: 'https://nova-url.ngrok-free.app',
//     token: 'token-do-seu-amigo'
// });

// Para testar a lista de arquivos (execute AGORA)
console.log('🔍 ARQUIVOS ENCONTRADOS PARA DEPLOY:\n');

const testDeployer = new FrontendDeployer();
console.log('📄 Frontend:', testDeployer.getFrontendFiles());
console.log('🖼️  Fotos:', testDeployer.getPhotoFiles());
console.log('⚙️  Backend:', testDeployer.getBackendFiles());

console.log('\n💡 Quando seu amigo acordar, execute:');
console.log('1. Obter a nova URL do ngrok');
console.log('2. Obter token (se necessário)');
console.log('3. Configurar no script');
console.log('4. node deploy-frontend.js');
