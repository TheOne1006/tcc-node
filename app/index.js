const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs');
const config = require('../config');


const core = {};

// core
const coreDir = path.join(__dirname, 'core');
const coreFiles = fs.readdirSync(coreDir);
const coreFileLen = coreFiles.length;

for (let index = 0; index < coreFileLen; index += 1) {
  const fileName = coreFiles[index];
  const fullPath = path.join(coreDir, fileName);


  const isFile = fs.statSync(fullPath).isFile();

  if (isFile) {
    const coreFactory = require(fullPath); // eslint-disable-line

    coreFactory(config, core);
  }
}

// database

const BaseModel = require('./common/BaseModel');


const sequelizeConfig = config.sequelize;

const sequelize = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.username,
  sequelizeConfig.password,
  sequelizeConfig,
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    throw new Error('Unable to connect to the database:', err);
  });

// load model
const modelDir = path.join(__dirname, 'model');
const models = {};

const modelFiles = fs.readdirSync(modelDir);
const modelFileLen = modelFiles.length;

for (let index = 0; index < modelFileLen; index += 1) {
  const fileName = modelFiles[index];
  const fullPath = path.join(modelDir, fileName);

  const isFile = fs.statSync(fullPath).isFile();

  if (isFile) {
    const modelFactory = require(fullPath); // eslint-disable-line

    const model = modelFactory(sequelize, Sequelize.DataTypes, BaseModel, core);
    models[model.name] = model;
  }
}

// load service
const serviceDir = path.join(__dirname, 'service');
const services = {};

const serviceFiles = fs.readdirSync(serviceDir);
const serviceFileLen = serviceFiles.length;

for (let index = 0; index < serviceFileLen; index += 1) {
  const fileName = serviceFiles[index];
  const fullPath = path.join(serviceDir, fileName);

  const serviceFactory = require(fullPath); // eslint-disable-line

  const serviceClass = serviceFactory(services, config, models, core);
  services[serviceClass.name] = serviceClass;
}

// load schedule
const scheduleDir = path.join(__dirname, 'schedule');
const schedules = {};
const scheduleFiles = fs.readdirSync(scheduleDir);
const scheduleFileLen = scheduleFiles.length;

for (let index = 0; index < scheduleFileLen; index += 1) {
  const fileName = scheduleFiles[index];
  const fullPath = path.join(scheduleDir, fileName);

  const scheduleClass = require(fullPath); // eslint-disable-line
  schedules[scheduleClass.name] = scheduleClass;
}

const app = {
  sequelize,
  models,
  config,
  services,
  schedules,
  core,
};

/**
 * 执行队列
 */
// core.queue.process('init', 1, services.ProcessJob.init);

module.exports = app;
