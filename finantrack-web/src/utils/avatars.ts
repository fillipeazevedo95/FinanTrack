// Avatares aleatórios para usuários
export const RANDOM_AVATARS = [
  '👨‍💼', // Homem de negócios
  '👩‍💼', // Mulher de negócios
  '👨‍💻', // Homem programador
  '👩‍💻', // Mulher programadora
  '👨‍🎓', // Homem formado
  '👩‍🎓', // Mulher formada
  '👨‍🔬', // Homem cientista
  '👩‍🔬', // Mulher cientista
  '👨‍⚕️', // Homem médico
  '👩‍⚕️', // Mulher médica
  '👨‍🏫', // Homem professor
  '👩‍🏫', // Mulher professora
  '👨‍🎨', // Homem artista
  '👩‍🎨', // Mulher artista
  '👨‍🍳', // Homem chef
  '👩‍🍳', // Mulher chef
  '👨‍🔧', // Homem mecânico
  '👩‍🔧', // Mulher mecânica
  '👨‍🌾', // Homem agricultor
  '👩‍🌾', // Mulher agricultora
  '🧑‍💼', // Pessoa de negócios
  '🧑‍💻', // Pessoa programadora
  '🧑‍🎓', // Pessoa formada
  '🧑‍🔬', // Pessoa cientista
  '🧑‍⚕️', // Pessoa médica
  '🧑‍🏫', // Pessoa professora
  '🧑‍🎨', // Pessoa artista
  '🧑‍🍳', // Pessoa chef
  '🧑‍🔧', // Pessoa mecânica
  '🧑‍🌾', // Pessoa agricultora
];

// Avatares alternativos mais simples
export const SIMPLE_AVATARS = [
  '😊', // Sorridente
  '😎', // Óculos escuros
  '🤓', // Nerd
  '😇', // Anjo
  '🥳', // Festa
  '🤗', // Abraço
  '😋', // Delícia
  '🤔', // Pensativo
  '😴', // Dormindo
  '🤩', // Estrelas nos olhos
  '😌', // Aliviado
  '🙂', // Levemente sorridente
  '😉', // Piscadinha
  '😄', // Sorriso grande
  '😃', // Sorriso aberto
];

// Função para obter avatar aleatório
export const getRandomAvatar = (): string => {
  const allAvatars = [...RANDOM_AVATARS, ...SIMPLE_AVATARS];
  const randomIndex = Math.floor(Math.random() * allAvatars.length);
  return allAvatars[randomIndex] || '👤';
};

// Função para obter avatar baseado no nome
export const getAvatarFromName = (name: string): string => {
  if (!name) return getRandomAvatar();
  
  // Usar o primeiro caractere do nome para gerar um avatar consistente
  const charCode = name.charCodeAt(0);
  const index = charCode % RANDOM_AVATARS.length;
  return RANDOM_AVATARS[index] || '👤';
};

// Função para obter lista de avatares para seleção
export const getAvatarOptions = () => {
  return [
    ...RANDOM_AVATARS.slice(0, 15), // Primeiros 15 avatares profissionais
    ...SIMPLE_AVATARS.slice(0, 10), // Primeiros 10 avatares simples
  ];
};
