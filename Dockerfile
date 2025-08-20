# Etapa 1: build
FROM node:20-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar dependencias de producción y desarrollo
RUN npm install

# Copiar todo el proyecto
COPY . .

RUN echo "ANTES DE BUILD:" && ls -R /app

# Compilar el proyecto (Nest -> TypeScript -> JavaScript)
RUN npm run build

RUN echo "DESPUÉS DE BUILD:" && ls -R /app

# Etapa 2: imagen final
FROM node:20-alpine AS production

# Crear directorio de trabajo
WORKDIR /app

# Copiar solo los archivos necesarios desde el build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Puerto expuesto (ajústalo según tu app, normalmente 3000)
EXPOSE 3000

# Comando para ejecutar la app
CMD ["node", "dist/main"]
