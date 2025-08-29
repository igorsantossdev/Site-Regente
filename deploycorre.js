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
        
        // Primeiro lista posts existentes para ver os IDs
        await this.listPosts();
        
        // Depois envia usuários (agora com campos em INGLÊS)
        await this.sendUsers();
        
        // Envia posts
        await this.sendPosts();

        // Lista posts novamente para ver os novos
        await this.listPosts();
        
        // Deleta um post (vamos tentar deletar o post com ID 1)
        await this.deletarPost(1);
        
        // Lista posts final para confirmar deleção
        await this.listPosts();
        
        console.log('🎯 Deploy de dados concluído!');
    }

    async sendUsers() {
        console.log('👤 Enviando usuários para api/user...');
        
        const users = [
            {
                name: "outro user",
                email: "outro.user@gmail.com",
                password: "outro.user123",
                password_confirmation: "outro.user123"
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
                
                // Corrigido: verifica se é erro de usuário já existe
                const errorData = error.response?.data;
                if (errorData && typeof errorData === 'object') {
                    if (errorData.message && errorData.message.includes('already exists')) {
                        console.log('⚠️  Usuário já existe, testando login...');
                        await this.testLogin(user.email, user.password);
                    }
                } else if (error.response?.status === 422) {
                    console.log('⚠️  Erro de validação, tentando login...');
                    await this.testLogin(user.email, user.password);
                }
            }
        }
    }

    async sendPosts() {
        console.log('📝 Enviando posts para api/posts...');
        
        const posts = [
            {
                titulo: "Primeiro Post Teste",
                Conteudo: "Este é um post de teste para ser deletado!",
                user_id: 1
            },
            {
                titulo: "Post de Boas Vindas",
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

    async listPosts() {
        console.log('📋 Listando todos os posts...');
        try {
            const response = await axios.get(`${this.API_URL}/api/posts`, {
                headers: {
                    'Accept': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('✅ Posts encontrados:');
            if (response.data && Array.isArray(response.data)) {
                response.data.forEach((post, index) => {
                    console.log(`${index + 1}. ID: ${post.id}, Título: ${post.titulo || post.title}`);
                });
            } else {
                console.log('Resposta:', response.data);
            }
            return response.data;
        } catch (error) {
            console.log('❌ Erro ao listar posts:', error.response?.data || error.message);
            return null;
        }
    }

    async deletarPost(postId) {
        console.log(`🗑️ Tentando deletar post com ID ${postId}...`);
        try {
            const response = await axios.delete(`${this.API_URL}/api/posts/${postId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000,
                data: {} // Algumas APIs precisam de um body vazio
            });

            console.log(`✅ Post com ID ${postId} deletado com sucesso!`);
            console.log('Resposta:', response.data);
            return response.data;
        } catch (error) {
            console.log(`❌ Erro ao deletar post com ID ${postId}:`, error.response?.data || error.message);
            
            // Se não conseguir deletar, tenta atualizar o post
            console.log('🔄 Tentando atualizar o post em vez de deletar...');
            await this.atualizarPost(postId, {
                titulo: "[DELETADO] Post removido",
                Conteudo: "Este post foi marcado como deletado",
                user_id: 1
            });
            
            return null;
        }
    }

    async atualizarPost(postId, novosDados) {
        console.log(`✏️ Atualizando post com ID ${postId}...`);
        try {
            const response = await axios.put(`${this.API_URL}/api/posts/${postId}`, novosDados, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log(`✅ Post com ID ${postId} atualizado com sucesso!`);
            console.log('Resposta:', response.data);
            return response.data;
        } catch (error) {
            console.log(`❌ Erro ao atualizar post com ID ${postId}:`, error.response?.data || error.message);
            return null;
        }
    }

    async testLogin(email = 'henrique@gmail.com', password = 'henrique123') {
        console.log(`🔐 Testando login com ${email}...`);
        try {
            const response = await axios.post(`${this.API_URL}/api/login`, {
                email: email,
                password: password
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
    await deployer.testLogin('outro.user@gmail.com', 'outro.user123');
    
    console.log('\n📞 DEPLOY CONCLUÍDO!');
}

console.log('🚀 Iniciando deploy de dados em 3 segundos...');
setTimeout(executeDeploy, 3000);
