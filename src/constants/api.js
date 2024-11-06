// API 相关配置
const ENV = {
  DEV: {
    BASE_URL: 'http://192.168.128.179:3000'
  },
  PROD: {
    BASE_URL: 'https://api.production.com'
  }
};

const currentEnv = process.env.NODE_ENV === "production" ? "PROD" : "DEV";

export const API = {
  BASE_URL: ENV[currentEnv].BASE_URL
};