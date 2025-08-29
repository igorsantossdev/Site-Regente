const fs = require('fs');
const path = require('path');
const axios = require('axios');

class CorrectDeployer {
    constructor() {
        this.API_URL = 'https://d28cd9defa7b.ngrok-free.app';
        this.token = 'SEU-TOKEN-AQUI'; // ← COLOCAR TOKEN REAL!
    }

    setup(config) {
        this.API_URL = config.url;
        this.token = config.token;
        console.log('✅ Configurado para:', this.API_URL);
    }

    async deploy() {
        console.log('🚀 Iniciando deploy com endpoints corretos...');
        
        // Primeiro verifica se o servidor está respondendo
        const isUp = await this.checkServerStatus();
        if (!isUp) {
            console.log('❌ Servidor não está respondendo. Verifique se php artisan serve está rodando.');
            return;
        }

        // Agora envia os dados usando os endpoints corretos
        await this.sendData();
    }

    async checkServerStatus() {
        try {
            console.log('🔍 Verificando status do servidor...');
            const response = await axios.get(`${this.API_URL}/up`, {
                timeout: 5000
            });
            console.log('✅ Servidor está respondendo!');
            return true;
        } catch (error) {
            console.log('❌ Servidor não está respondendo:', error.message);
            return false;
        }
    }

    async sendData() {
        console.log('📦 Preparando dados para envio...');
        
       

        await this.deletarpost();
        
        console.log('🎯 Deploy de dados concluído!');
    }

    async sendUsers() {
        console.log('👤 Enviando usuários para api/user...');
        
        const users = [
            {
                nome: "Henrique",
                email: "henrique@gmail.com",
                senha: "henrique123",
                confirmacao_senha: "henrique123"
            },
            {
                nome: "Amigo", 
                email: "amigo@gmail.com",
                senha: "amigo123",
                confirmacao_senha: "amigo123"
            }
        ];

        for (const user of users) {
            try {
                console.log('Enviando usuário:', JSON.stringify(user, null, 2));
                
                const response = await axios.post(`${this.API_URL}/api/user`, user, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                console.log(`✅ Usuário ${user.email} criado com sucesso!`);
                console.log('Resposta:', response.data);
            } catch (error) {
                console.log(`❌ Erro ao criar usuário ${user.email}:`, error.response?.data || error.message);
            }
        }
    }

    async sendPosts() {
        console.log('📝 Enviando posts para api/posts...');
        
        const posts = [
            {
                titulo: "Primeiro Post",
                Conteudo: "Este é o primeiro post do blog!",
                user_id: 1
            },
            {
                titulo: "Bem-vindo",
                Conteudo: "Seja bem-vindo ao nosso blog!",
                user_id: 2
            }
        ];

        for (const post of posts) {
            try {
                console.log('Enviando post:', JSON.stringify(post, null, 2));
                
                const response = await axios.post(`${this.API_URL}/api/posts`, post, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    timeout: 10000
                });

                console.log(`✅ Post "${post.titulo}" criado com sucesso!`);
                console.log('Resposta:', response.data);
            } catch (error) {
                console.log(`❌ Erro ao criar post:`, error.response?.data || error.message);
            }
        }
    }

    async testLogin() {
        console.log('🔐 Testando login...');
        try {
            const response = await axios.post(`${this.API_URL}/api/login`, {
                email: 'henrique@gmail.com',
                password: 'henrique123'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });
            
            console.log('✅ Login testado com sucesso!');
            console.log('Resposta completa:', response.data);
            
            // Tenta diferentes formatos de token
            const token = response.data.token || response.data.access_token || response.data.Token;
            console.log('Token recebido:', token);
            
            return response.data;
        } catch (error) {
            console.log('❌ Login falhou:', error.response?.data || error.message);
            return null;
        }
    }
    async deletarpost(){
        console.log('🗑️ Deletando post com id 1...');
        try{
            const response = await axios.delete(`${this.API_URL}/api/posts/1`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                timeout: 10000
            });

            console.log(`✅ Post com id 1 deletado com sucesso!`);
            console.log('Resposta:', response.data);
        } catch (error) {
            console.log(`❌ Erro ao deletar post com id 1:`, error.response?.data || error.message);
        }
    }
}

// 👇 USO CORRETO 👇
const deployer = new CorrectDeployer();

// Configurar (substitua com token real!)
deployer.setup({
    url: 'https://d28cd9defa7b.ngrok-free.app', 
    token: 'TOKEN-DO-AMIGO-AQUI' // ← SUBSTITUIR COM TOKEN REAL!
});

// Executar deploy
async function executeDeploy() {
    console.log('🎯 Iniciando deploy de dados...');
    
    // Executa o deploy de dados
    await deployer.deploy();
    
    // Testa o login após o deploy
    console.log('\n🔐 Testando login após deploy...');
    await deployer.testLogin();
    
    console.log('\n📞 DEPLOY CONCLUÍDO!');
}

console.log('🚀 Iniciando deploy de dados em 3 segundos...');
setTimeout(executeDeploy, 3000);
