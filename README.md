# FCA Tasks

Este programa escrito em NodeJS serve para gerar automaticamete e disponibilizar um relatório em excel extraído de um banco Oracle.
Ele é automaticamente acionado toda segunda e sexta feira pela manhã.
Roda no 

## Dependências

### NodeJS

Você deve ter o node previamente instalado

### Oracle Client

Antes de instalar as dependências, o Oracle Client deve estar configurado,
Veja [aqui](https://github.com/oracle/node-oracledb/blob/master/INSTALL.md) como proceder com a instalação de acordo com seu sistema operacional

### Dependências Globais

### [PM2](https://github.com/Unitech/pm2)

```sh
$ npm install -g pm2
```

### Instalando dependências

```sh
$ npm install
```

## Rodando o programa

Dois módulos do programas devem estar em funcionamento
download.js - Possui a rota para download do arquivo gerado
taskf.js - Tarefa que irá executar automaticamente nos dias programados para gerar o relatório

```sh
$ pm2 start download.js
$ pm2 start taskf.js
```
Veja mais informação em [PM2](https://github.com/Unitech/pm2)

##Autor

[Fabrcio Souza](https://github.com/FabricioCollins)