import express from 'express';
import http, { get } from 'http';
import https from 'https';
import path from "path";
import { fileURLToPath } from "url";
import cors from 'cors';
import fs from 'fs';
import fsPromises from 'fs/promises';
import os from 'os';
import { createRequire } from 'module';
import EventSource from'eventsource';
import HttpsProxyAgent from 'https-proxy-agent';
import axios from 'axios';
import si from 'systeminformation';
import crypto from 'crypto';
import { chromium } from '@playwright/test';
import { Readable } from 'stream';
//版本号
const banbenhao = "1.4";

class MemoryMonitor {
    constructor(page) {
        this.page = page;
        this.warningThreshold = 200 * 1024 * 1024;  // 400MB 警告阈值
        this.criticalThreshold = 400 * 1024 * 1024; // 500MB 临界阈值
    }

    async checkMemory() {
        try {
            const metrics = await this.page.evaluate(() => {
                if (!performance.memory) return null;
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
                };
            });

            if (!metrics) {
                console.log('Memory metrics not available');
                return null;
            }

            // 转换为MB便于阅读
            const usedMB = Math.round(metrics.usedJSHeapSize / (1024 * 1024));
            const totalMB = Math.round(metrics.totalJSHeapSize / (1024 * 1024));
            const limitMB = Math.round(metrics.jsHeapSizeLimit / (1024 * 1024));

            console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);

            // 内存使用超过警告阈值
            if (metrics.usedJSHeapSize > this.warningThreshold) {
                console.warn('High memory usage detected!');
                await this.optimizeMemory();
            }

            // 内存使用超过临界值
            if (metrics.usedJSHeapSize > this.criticalThreshold) {
                console.error('Critical memory usage! Forcing garbage collection...');
                await this.forceGC();
            }

            return metrics;
        } catch (error) {
            console.error('Error checking memory:', error);
            return null;
        }
    }

    async optimizeMemory() {
        try {
            await this.page.evaluate(() => {
                // 清除控制台
                console.clear();
                
                // 清除未使用的图片
                const images = document.getElementsByTagName('img');
                for (let img of images) {
                    if (!img.isConnected) {
                        img.src = '';
                    }
                }

                // 清除未使用的变量
                if (window.gc) {
                    window.gc();
                }
            });
        } catch (error) {
            console.error('Error optimizing memory:', error);
        }
    }

    async forceGC() {
        try {
            await this.page.evaluate(() => {
                if (window.gc) {
                    window.gc();
                }
            });
        } catch (error) {
            console.error('Error forcing GC:', error);
        }
    }
}

async function setupMemoryMonitoring(page) {
    const monitor = new MemoryMonitor(page);
    
    // 定期检查内存（每5分钟）
    setInterval(async () => {
        await monitor.checkMemory();
    }, 1 * 60 * 1000);

    // 返回monitor实例以便手动调用
    return monitor;
}

// 初始化监控
let memoryMonitor;
// 初始化监控
let memoryMonitor2;
// 使用 createRequire 来导入 JSON 文件

const require = createRequire(import.meta.url);
const cookiesjson = require('./cookies.json');

const config = require('./config.json');
const app = express();
const server = http.createServer(app);
let requestId = null;
let resssss = null;
let Aborted=false;
let Message;
let userId;
// 设置本地代理
const proxyUrl = config.proxyUrl;
const proxyAgent = config.proxy ? new HttpsProxyAgent(proxyUrl) : null;
const EventEmitter = require('events');
const URL = require('url').URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

let browser = null;
let page = null;
let customEventSource;
let  isRestarting;
let  rrreeeqqq;
let reqmessage="";
let isstream=false;
let nowcookie="";
let nowcount=0;
let nowfilename="";
let One=true;
let cookiesCount=0;
// Worker 的基础 URL
const baseUrl = 'https://tongji2.damoshen2.workers.dev';

const baseUrl2 = 'https://you.com';
// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: baseUrl,
  httpsAgent: proxyAgent
});
// 全局捕获未处理的 Promise 异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // 可以选择不退出程序
  // process.exit(1);
});

// 全局捕获未处理的同步异常
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // 可以选择优雅地处理错误
  // process.exit(1);
});
function updateCookiesJson(key, value) {
    // 修改内存中的对象
    console.log(key,cookiesjson[key]);
    cookiesjson[key].count= value;
  
    // 写入文件
    fs.writeFileSync(
      path.join(__dirname, 'cookies.json'), 
      JSON.stringify(cookiesjson, null, 2)
    );
  }



function processFileContents(fileContents, cookiesjson) {

    let cookieNowCount=0;
    console.log(`cookiesCount：：：111`,cookiesCount);

    console.log(`cookiesjsonaaaaaaaaaaaaaaaaaaaa`,fileContents.length);

    if(cookiesCount >= (fileContents.length)){
      cookiesCount=0;
    }
    console.log(`cookiesCount：：：`,cookiesCount);
    // 获取当前时间戳（秒）
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // 遍历 fileContents 中的文件
    for (const [fileName, content] of Object.entries(fileContents)) {
      // 检查 cookiesjson 中是否存在该文件的记录
      if (!cookiesjson[content.fileName]) {
        console.log(`filename`,content.fileName);
        console.log(`content`,content);
        // 如果不存在，创建新记录
        cookiesjson[content.fileName] = {
          timestamp: currentTimestamp,
          count: 0
        };
        
        // 写入 cookiesjson 文件
        fs.writeFileSync(
          path.join(__dirname, 'cookies.json'), 
          JSON.stringify(cookiesjson, null, 2)
        );
  
        // 返回文件内容
        nowfilename=content.fileName;
        nowcount=0;
        if(cookieNowCount >= cookiesCount){
          cookiesCount=cookiesCount+1;
          console.log(`cookiesCount`,cookiesCount);
        return content;
      }

      } else {
        // 如果存在记录，检查使用次数和时间
        const fileRecord = cookiesjson[content.fileName];
        console.log(`fileRecord`,fileRecord);
        const timeDiff = currentTimestamp - fileRecord.timestamp;
  
        // 如果使用次数小于3，直接返回内容
        if (fileRecord.count < config.twoHours||config.pro) {
          
          nowcount=fileRecord.count;
          // 写入 cookiesjson 文件
        //   fs.writeFileSync(
        //     path.join(__dirname, 'cookiesjson.json'),
        //     JSON.stringify(cookiesjson, null, 2)
        //   );
          nowfilename=content.fileName;
          if(cookieNowCount >= cookiesCount){
            cookiesCount=cookiesCount+1;
            console.log(`cookiesCount`,cookiesCount);
            const time11 = currentTimestamp - fileRecord.timestamp;

            console.log(`currentTimestamp`,currentTimestamp);
            console.log("fileRecord.timestamp",fileRecord.timestamp);

            console.log(`time11`,time11);
            if(time11 > 7200){
              fileRecord.count = 0;
              fileRecord.timestamp = currentTimestamp;
              updateCookiesJson(nowfilename,0);
            }
            return content;
          }
        }
        // 如果使用次数大于等于3，检查时间
        else {
          // 如果时间小于24小时（86400秒）
          if (timeDiff > 7200) {
            // 重置次数为0
            fileRecord.count = 0;
            fileRecord.timestamp = currentTimestamp;
            // 写入 cookiesjson 文件
            fs.writeFileSync(
              path.join(__dirname, 'cookies.json'),
              JSON.stringify(cookiesjson, null, 2)
            );
            nowcount=fileRecord.count;
            nowfilename=content.fileName;
            if(cookieNowCount >= cookiesCount){
              cookiesCount=cookiesCount+1;
              console.log(`cookiesCount`,cookiesCount);
              const time11 = currentTimestamp - fileRecord.timestamp;
              console.log(`time11`,time11);
              if(time11 > 7200){
                updateCookiesJson(nowfilename,0);
              }
              return content;
            }

          }
        }
        cookieNowCount=cookieNowCount+1;
      }
    }
  
    // 如果没有找到可用的文件，返回 null
    return null;
}

const axiosInstance2 = axios.create({
    baseURL: baseUrl2,
    httpsAgent: proxyAgent
  });


// 获取版本号
async function getVersion() {
  try {
    const response = await axiosInstance.get('/api/version');
    console.log('Version:', response.data.version);
    return response.data.version;
  } catch (error) {
    console.error('Error fetching version:', error.message);
  }
}

// 记录用户请求
async function recordUserRequest(userId) {
  try {
    const response = await axiosInstance.post('/api/record',
      { userId: userId },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log('Record response:', response.data);
  } catch (error) {
    console.error('Error recording user request:', error.message);
  }
}

// 生成唯一的电脑用户ID
async function generateUniqueUserId() {
    try {
      const [cpu, system, osInfo, uuid] = await Promise.all([
        si.cpu(),
        si.system(),
        si.osInfo(),
        si.uuid()
      ]);
  
      const hardwareInfo = {
        cpuId: cpu.processor_id || '',
        systemUuid: system.uuid || '',
        systemModel: system.model || '',
        osUuid: osInfo.uuid || '',
        machineUuid: uuid.hardware || ''
      };
  
      const combinedInfo = Object.values(hardwareInfo).join('-');
      const hash = crypto.createHash('sha256');
      hash.update(combinedInfo);
      return hash.digest('hex');
    } catch (error) {
      console.error('Error generating unique user ID:', error);
      return 'unknown-' + Date.now();
    }
  }
  


  function getCookiesFiles() {
    // 获取当前目录下的 cookies 文件夹路径
    const cookiesPath = path.join(__dirname, 'cookies');
  
    try {
      // 读取 cookies 文件夹下的所有文件
      const files = fs.readdirSync(cookiesPath);
  
      // 过滤出 txt 文件
      const txtFiles = files.filter(file => path.extname(file).toLowerCase() === '.txt');
  
      // 存储文件信息的数组
      const fileContents = [];
  
      // 遍历 txt 文件
      txtFiles.forEach(file => {
        const filePath = path.join(cookiesPath, file);
        
        // 读取文件内容
        const content = fs.readFileSync(filePath, 'utf-8');
  
        fileContents.push({
          fileName: file,
          content: content
        });
      });
      return fileContents;
    } catch (error) {
      console.error('读取 cookies 文件夹失败:', error);
      return [];
    }
  }



  function getSessionCookie(cookieString) {
    var sessionCookie = cookieString.split('; ').map(pair => {
        const [name, value] = pair.split('=');
        return { name, value, domain: '.x.com', path: '/' };
    });
    return sessionCookie;
}


  let fileContents=getCookiesFiles();
  
  fileContents.forEach(file => {
    try {
      getSessionCookie(file.content)
    } catch (error) {

      console.error('Error parsing cookies:', "cookies文件出错"+file.fileName);
      return;
    }
   
  })



  let  context="";


async function initializeBrowser() {
    try {
        let viewportSize = { width: 900, height: 700 }; // 可以根据需要调整这些值


        browser = await chromium.launch({
            channel: config.channel,
            deviceScaleFactor: 1,
            isMobile: false,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
            headless: config.wutou });

        // 创建上下文
        context = await browser.newContext(
            {viewport: viewportSize,
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
                extraHTTPHeaders: {
                    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"'
                  },
                  bypassCSP: true
        }
            );
        page = await context.newPage();
        // 初始化脚本
        await context.addInitScript(() => {
            // 部分伪装，不完全移除
            Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined  // 不返回 false，而是 undefined
            });

            // 模拟真实浏览器特征
            Object.defineProperty(navigator, 'plugins', {
            get: () => [
                { name: 'Chrome PDF Plugin' },
                { name: 'Chrome PDF Viewer' }
            ]
            });
        });

        memoryMonitor = await setupMemoryMonitoring(page);

        // 设置cookie


        nowcookie=await processFileContents(fileContents,cookiesjson);
        if(!nowcookie){

            console.log("无cookie使用");
            return;
        }
        const sessionCookie=getSessionCookie(nowcookie.content)
       

        await context.addCookies(sessionCookie);


        let version =await getVersion();
        console.log(version);

        if(banbenhao == version){

            console.log("最新版本无需更新");

        }else{

            console.log(`当前版本：${banbenhao},拥有新版本${version},请进行更新！`);
        }

        userId=await generateUniqueUserId();
        try {
        // 捕获网络错误
        page.on('requestfailed', (request) => {
            console.error('Failed Request:', request.url(), request.failure().errorText);
            });    

            await page.addInitScript(() => {
              // 在页面加载前就禁用 Service Worker
              if ('serviceWorker' in navigator) {
                  Object.defineProperty(navigator, 'serviceWorker', {
                      value: {
                          register: () => Promise.reject('Service Worker disabled'),
                          getRegistration: () => Promise.resolve(null)
                      },
                      writable: false
                  });
              }
          });
        page.goto('https://x.com/i/grok');
        console.log('Successfully opened grok');



        // 检查是否成功登录
        // 检查是否成功登录
        // 
            // await page.waitForSelector('.sc-19bbc80a-2', { timeout: 20000 });
            // const isLoggedIn = await page.locator('.sc-19bbc80a-2').count() > 0;
            // console.log('Login status:', isLoggedIn);

          console.log('欢迎使用grok反代，成功启动！By从前跟你一样');

            } catch (error) {
                console.log(error);
            }
      
        // await page.waitForTimeout(5000);
        // await context.addCookies(getSessionCookie(config.cookie2));
    } catch (error) {
        console.error('An error occurred during browser initialization:', error);
    }
}
async function restartBrowser() {
    console.log('Restarting browser...');
    isRestarting = true;
    if (browser) {
        await browser.close();
    }
    await initializeBrowser();
    isRestarting = false;
    console.log('Browser restarted successfully');
}
// 初始化浏览器
initializeBrowser();

// 在服务器关闭时关闭浏览器
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

const availableModels = [
    { id: "gork-3", name: "gork-3" },
    { id: "gork-3-上传", name: "gork-3-上传" }
];

let Upload=false;

app.post('/v1/chat/completions', async (req, res) => {
    console.log('Received chat request');
    reqmessage="";
    One=true;
    resssss = res;
    
    Aborted = false;

    res.on('close', async () => {
        console.log('Client disconnected');
        Aborted = true;
        if(rrreeeqqq){
        customEventSource.close();
        resssss=null;
        }
    });

    let body=req.body
    //是否采用上传模式
    if(req.body.model=="gork-3-上传"){

      Upload=true;

    }else{

      Upload=false;
    }


  
    if(!body.hasOwnProperty('stream')||!body["stream"]){
        isstream=false;
    }else{
        isstream=true;
    }
    res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    req.setEncoding("utf8");
    console.log("isstream",isstream)
  //  console.log('Received chat request:', req.body);
    await sendMessage(res, req.body);
});

app.get('/v1/models', (req, res) => {
    Aborted = false;
    res.json({
        object: "list",
        data: availableModels.map(model => ({
            id: model.id,
            object: "model",
            created: 1623168000,
            owned_by: "openai",
            permission: [],
            root: model.id,
            parent: null
        })),
    });
    res.on('close', () => {
        console.log('Client disconnected');
    });

});


class CustomEventSource extends EventEmitter {
    constructor(url, options = {}) {
        super();
        this.url = new URL(url);
        this.options = options;
        console.log("options",options);
        this.reconnectInterval = 1000;
        this.shouldReconnect = true;
        this.req = null; // 添加 req 属性
        this.connect();
    }

    connect() {

        
        if(One){
            One=false;
            console.log('开始请求');
           }else{
             
            return null;
         }
        // 如果已经有活跃的请求，先关闭它
        if (this.req) {
            this.req.destroy();
        }

        const requestOptions = {
            method: this.options.method || 'GET',
            headers: {
                ...this.options.headers
            },
            agent: this.options.agent,
            timeout: 3000
        };

        const client = this.url.protocol === 'https:' ? https : http;
        
        // 将 req 赋值给 this.req
        this.req = client.request(this.url, requestOptions, (res2) => {
            let buffer = '';
            
            res2.on('data', (chunk) => {
                console.log('Received data:', chunk.toString('utf-8'));
                 let data = chunk.toString('utf-8');
                 
                const lines = data.split('\n');
                buffer = lines.pop();

                lines.forEach(line => {
                      let shuju=JSON.parse(line);
                      if(shuju.hasOwnProperty('result')&&shuju.result.hasOwnProperty("message")){
                        this.emit('message', shuju.result);
                      //  console.log("shuju.result:",shuju.result)
                       }
                    
                });

            });

            res2.on('end', () => {
                if (this.shouldReconnect) {
                    this.emit('end', 'Stream ended');
                    setTimeout(() => this.connect(), this.reconnectInterval);
                } else {
                    this.emit('close', 'Connection closed');
                }
                return null;
            });
        });

        this.req.on('error', (error) => {
            this.emit('error', error);
            if (this.shouldReconnect) {
                setTimeout(() => this.connect(), this.reconnectInterval);
            }
        });

        if (this.options.body) {
            this.req.write(this.options.body);
        }

        this.req.end();
    }

    close() {
        this.shouldReconnect = false; // 阻止重连
        
        // 立即销毁当前请求
        if (this.req) {
            this.req.destroy(); // 使用 destroy 方法更彻底地关闭连接
            this.req = null; // 清空请求引用
        }
        return null;
    }
}


let viptanchuan=false;

let newuse=true;

let  localCopyPath="";

async function sendMessage(res3, message) {

          
    let isResponseEnded = false;
    if(config.pro){

    }else{
        fileContents=getCookiesFiles();
        nowcookie=processFileContents(fileContents,cookiesjson);
        if(!nowcookie){
          cookiesCount=0;
          nowcookie=processFileContents(fileContents,cookiesjson);
        }

        if(!nowcookie){
          const text = "没有cookie用了";
          const response = {
              id: "chatcmpl-" + Math.random().toString(36).substr(2, 9),
              object: "chat.completion",
              created: Date.now(),
              model: "gpt-3.5-turbo-0613",
              usage: {
                  prompt_tokens: 9,
                  completion_tokens: text.length,
                  total_tokens: 9 + text.length
              },
              choices: [{
                  delta: {
                      role: 'assistant',
                      content: text || null
                  },
                  finish_reason: null,
                  index: 0
              }]
          };
            resssss.write(`data: ${JSON.stringify(response).replace("\\n", "\\n ")}\n\n`);
            resssss.end();
            return;
        }
    }

    const sessionCookie=getSessionCookie(nowcookie.content)
    console.log("sessionCookie",sessionCookie);

    await context.addCookies(sessionCookie);


//新建聊天
    try {
      // 等待按钮可见且 aria-hidden 为 false
          const manageSourcesButton = await page.waitForSelector(
              'button[aria-label="新聊天"][role="button"]', 
              { 
                state: 'visible',
                timeout: 100
              }
            );
          if(manageSourcesButton){
              await page.evaluate(() => {
                  const button = document.querySelector(
                    'button[aria-label="新聊天"][role="button"]'
                  );
                  if (button) button.click();
                });
          }

      } catch (error) {
        try {
          // 等待按钮可见且 aria-hidden 为 false
              const manageSourcesButton = await page.waitForSelector(
                  'button[aria-label="New Chat"][role="button"]', 
                  { 
                    state: 'visible',
                    timeout: 100
                  }
                );
              if(manageSourcesButton){
                  await page.evaluate(() => {
                      const button = document.querySelector(
                        'button[aria-label="New Chat"][role="button"]'
                      );
                      if (button) button.click();
                    });
              }
    
          } catch (error) {
            try {
              // 等待按钮可见且 aria-hidden 为 false
                  const manageSourcesButton = await page.waitForSelector(
                      'button[aria-label="新聊天"][role="button"]', 
                      { 
                        state: 'visible',
                        timeout: 100
                      }
                    );
                  if(manageSourcesButton){
                      await page.evaluate(() => {
                          const button = document.querySelector(
                            'button[aria-label="新聊天"][role="button"]'
                          );
                          if (button) button.click();
                        });
                  }
        
              } catch (error) {
                console.log("无需开启新聊天");
        
              }
    
          }
        
      }

    //新建聊天
    
    await setupRequestInterception(page);
    await new Promise(resolve => setTimeout(resolve, 200));

    
    try {
        message = message.messages;
        message = simplifyJsonString(message)
        function simplifyJsonString(message) {
            try {
              
              // 将每个消息转换为简化的文本格式
              let simplifiedMessages = message.map(msg => {
               
                if(config.tohuman){
                      
                    return `${msg.role.replace("user","Human").replace("assistant","Assistant")}: ${msg.content}`;

                }else{
                    return `${msg.role}: ${msg.content}`;
                }
              });
              
              // 将所有简化的消息用换行符连接
              return simplifiedMessages.join('\n\n');
            } catch (error) {
              console.error("Error parsing JSON:", error);
              return "Error: Invalid JSON string";
            }
          }
          Message = message;
     //   console.log('Formatted messages:', message);
        if(Upload){
                      let yuyan="提出任何問題";

                      const txtname= Math.random().toString(36).substring(3);
                      localCopyPath = path.join(__dirname, `${txtname+".txt"}`);
                      fs.writeFileSync(localCopyPath, message);

                      let textarea=null;

                      try {
                        textarea = await page.getByPlaceholder('提出任何問題').first();
                        await textarea.waitFor({ state: 'visible', timeout: 100 });

                      } catch (error) {
                        // 处理超时错误
                        try {
                          textarea = await page.getByPlaceholder('随便问点什么').first();
                          await textarea.waitFor({ state: 'visible', timeout: 100 });
                          yuyan="随便问点什么";
                  
                        } catch (error) {
                        try {
                          textarea = await page.getByPlaceholder('Ask anything').first();
                          await textarea.waitFor({ state: 'visible', timeout: 100 });
                          yuyan="Ask anything";
                  
                        } catch (error) {
                          // 处理超时错误
                          console.error('操作超时:', error);
                        }
                      }
                    }

                        if (!textarea) {

                          console.log('textarea not found');
                          return false;
                          
                        }
                        try { 

                          // ... existing code ...


                          await new Promise(resolve => setTimeout(resolve, 200));


                             const fileInput = await page.locator('input[type="file"]');
                              // 强制清空文件列表（即使支持多文件）
                              try {
                                // 使用 waitForSelector 设置超时时间
                                await page.waitForSelector('button[aria-label="Remove"]', { 
                                  timeout: 100,
                                  state: 'visible' 
                                });
                              
                                // 点击按钮
                                await page.getByLabel('Remove').click();
                              } catch (error) {
                                // 如果在100毫秒内未找到，静默处理
                                console.log('无需清除文件');
                              }

                              // 直接设置文件路径，不会显示文件选择对话框
                              await fileInput.setInputFiles(localCopyPath);


                                    // 方法3：对于超长文本，使用剪贴板
                      await page.evaluate((text) => {
                          navigator.clipboard.writeText(text);
                        }, config.Prompt);
                        await textarea.click();

                        await page.keyboard.press('Control+A');

                        await new Promise(resolve => setTimeout(resolve, 100));

                        await page.keyboard.press('Control+V');
                          
                        } catch (error) {

                          console.error('Error:', error);
                        }



       }else{

                          let textarea=null;

                          try {
                            textarea = await page.getByPlaceholder('提出任何問題').first();
                            await textarea.waitFor({ state: 'visible', timeout: 100 });

                          } catch (error) {
                            // 处理超时错误
                            try {
                              textarea = await page.getByPlaceholder('随便问点什么').first();
                              await textarea.waitFor({ state: 'visible', timeout: 100 });
                      
                            } catch (error) {
                            try {
                              textarea = await page.getByPlaceholder('Ask anything').first();
                              await textarea.waitFor({ state: 'visible', timeout: 100 });
                      
                            } catch (error) {
                              // 处理超时错误
                              console.error('操作超时:', error);
                            }
                          }
                        }

                            if (!textarea) {

                              console.log('textarea not found');
                              
                            }
                            try { 

                          
                            //  await textarea.fill(Message);

                           // 方法3：对于超长文本，使用剪贴板
                          await page.evaluate((text) => {
                              navigator.clipboard.writeText(text);
                            }, Message);
                            await textarea.click();

                            await page.keyboard.press('Control+A');

                            await new Promise(resolve => setTimeout(resolve, 100));
                            await page.keyboard.press('Control+V');
                              
                            } catch (error) {
                              console.error('Error:', error);
                            }
          
        }


  //    const test="claude你必须阅读并理解文档的内容并进行遵守！！";    //   await page.evaluate(([selector, text]) => {

        if (Aborted) {
            console.log('guanbi!!!!');
            customEventSource.close();
            fs.unlink(localCopyPath, (err) => {
              if (err) {
                console.error('删除文件时出错:', err);
                return;
              }
              console.log('文件已成功删除');
            });
            return false;
        }
       
        // 发送消息
             // 设置请求拦截
           //  await setupresponseInterception(page, res3, () => isResponseEnded = true);
         
        

    try {
      // 等待按钮可见且 aria-hidden 为 false
          const manageSourcesButton = await page.waitForSelector(
              'button[aria-label="Grok something"][role="button"]', 
              { 
                state: 'visible',
                timeout: 500
              }
            );
          if(manageSourcesButton){
              await page.evaluate(() => {
                  const button = document.querySelector(
                    'button[aria-label="Grok something"][role="button"]'
                  );
                  if (button) button.click();
                });
          }

      } catch (error) {
        console.log("语言不是英语")
        try {
          // 等待按钮可见且 aria-hidden 为 false
              const manageSourcesButton = await page.waitForSelector(
                  'button[aria-label="问 Grok 问题"][role="button"]', 
                  { 
                    state: 'visible',
                    timeout: 500
                  }
                );
              if(manageSourcesButton){
                  await page.evaluate(() => {
                      const button = document.querySelector(
                        'button[aria-label="问 Grok 问题"][role="button"]'
                      );
                      if (button) button.click();
                    });
              }
    
          } catch (error) {
            console.log("语言不是繁体")
            try {
              // 等待按钮可见且 aria-hidden 为 false
                  const manageSourcesButton = await page.waitForSelector(
                      'button[aria-label="問 Grok 一些問題"][role="button"]', 
                      { 
                        state: 'visible',
                        timeout: 500
                      }
                    );
                  if(manageSourcesButton){
                      await page.evaluate(() => {
                          const button = document.querySelector(
                            'button[aria-label="問 Grok 一些問題"][role="button"]'
                          );
                          if (button) button.click();
                        });
                  }
        
              } catch (error) {
                console.error('发送点击错误', error);
        
              }
    
          }
        
      }

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });

      try {
        if(Upload){
        fs.unlink(localCopyPath, (err) => {
          if (err) {
            console.error('删除文件时出错:', err);
          }
          console.log('文件已成功删除');
        });
      }

      } catch (error) {
        console.error('删除文件时出错:', err);
      }


          nowcount=nowcount+1
          updateCookiesJson(nowfilename,nowcount);

          console.log('nowfilename',nowfilename);
          console.log('nowcount',nowcount);

       
        if (Aborted) {
            console.log('guanbi!!!!');
            customEventSource.close();
            fs.unlink(localCopyPath, (err) => {
              if (err) {
                console.error('删除文件时出错:', err);
                return;
              }
              console.log('文件已成功删除');
            });
            return false;
        }
       // recordUserRequest(userId);

    } catch (error) {
        console.error('Error in sendMessage:', error);
        if (!isResponseEnded) {
            res3.write(`data: [ERROR]\n\n`);
            res3.end();
        }
    }
}

async function clickElement(selector, page) {
    await page.waitForSelector(selector, { timeout: 10000 });
    const element = await page.$(selector);
    if (element) {
        await element.click();
        console.log(`Successfully clicked the element with class "${selector}"`);
    } else {
        console.log(`Element with class "${selector}" not found`);
    }
}

async function uploadFile(selector, filePath, page) {
    // const element = await page.$(selector);
    // if (element) {
    //     console.log(`Successfully found the element with class "${selector}"`);
    //     const [fileChooser] = await Promise.all([
    //         page.waitForFileChooser(),
    //         page.click(selector),
    //     ]);
    //     await fileChooser.accept([filePath]);
    // } else {
    //     console.log(`Element with class "${selector}" not found`);
    // }
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
        // 读取文件内容
        const fileContent = await fsPromises.readFile(filePath);
        const fileName = path.basename(filePath);
    
        console.log(`File size: ${fileContent.length} bytes`);
    
        // 获取文件类型
        const fileType = getFileType(fileName);
    
        // 在浏览器中执行文件上传模拟
        await page.evaluate(async ({ fileName, fileContent, fileType,selector}) => {
          // 将 ArrayBuffer 转换为 Uint8Array
          const uint8Array = new Uint8Array(fileContent);
          
          // 将 Uint8Array 转换为 Blob
          const blob = new Blob([uint8Array], { type: fileType });
          
          console.log(`Blob size: ${blob.size} bytes`);
    
          // 创建 File 对象
          const file = new File([blob], fileName, { type: fileType });
          
          console.log(`File size: ${file.size} bytes`);
    
          // 创建 DataTransfer 对象
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
    
          // 创建拖拽事件
          const createDragEvent = (type) => {
            return new DragEvent(type, {
              bubbles: true,
              cancelable: true,
              dataTransfer: dataTransfer
            });
          };

          console.log('File upload simulation started for:', selector);
          // 模拟拖拽过程
          const dropZone = document.querySelector(`[placeholder="${selector}"]`);
          
          dropZone.dispatchEvent(createDragEvent('dragenter'));
          dropZone.dispatchEvent(createDragEvent('dragover'));
          dropZone.dispatchEvent(createDragEvent('drop'));
    
          console.log('File upload simulation completed for:', fileName);
        }, { fileName, fileContent: Array.from(fileContent), fileType,selector });
    
        console.log('File upload process completed successfully.');
      } catch (error) {
        console.error('Error during file upload:', error);
        throw error;
      }
      
    function getFileType(fileName) {
        const extension = path.extname(fileName).toLowerCase();
        switch (extension) {
          case '.jpg':
          case '.jpeg':
            return 'image/jpeg';
          case '.png':
            return 'image/png';
          case '.gif':
            return 'image/gif';
          case '.pdf':
            return 'application/pdf';
          default:
            return 'application/octet-stream';
        }
      }
    }
    
    



function getFileType(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  switch (extension) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
 }

 async function setupresponseInterception(page, res4, setResponseEnded) {


    page.on('response', async (response) => {
        if (response.url().includes('/api/streamingSearch')) {
            const reader = response.body().getReader(); // 获取流的读取器
            
            let done, value;
            const decoder = new TextDecoder('utf-8'); // 创建解码器

            while (true) {
                // 逐块读取数据
                ({ done, value } = await reader.read());

                if (done) {
                    console.log('流结束');
                    break;
                }

                // 解码并处理数据块
                const chunkString = decoder.decode(value, { stream: true });
                console.log('接收到的数据块:', chunkString);

                // 尝试解析 JSON
                try {
                    const jsonData = JSON.parse(chunkString);
                    console.log('解析的 JSON 数据:', jsonData);
                } catch (error) {
                    console.error('JSON 解析错误:', error);
                }
            }
        }
    });



 }





 async function setupRequestInterception(page) {
    // Playwright 使用 route 而不是 setRequestInterception
    await page.unroute('**/*');

    await page.addInitScript(() => {
      // 在页面加载前就禁用 Service Worker
      if ('serviceWorker' in navigator) {
          Object.defineProperty(navigator, 'serviceWorker', {
              value: {
                  register: () => Promise.reject('Service Worker disabled'),
                  getRegistration: () => Promise.resolve(null)
              },
              writable: false
          });
      }
  });

    console.log('设置请求拦截器..`````````````````````````````````````````````````````````````````````````````````.');
   // await new Promise(resolve => setTimeout(resolve, 100));

  //   await page.evaluate(() => {
  //     // 注销所有 Service Worker
  //     if ('serviceWorker' in navigator) {
  //         navigator.serviceWorker.getRegistrations().then(registrations => {
  //             registrations.forEach(registration => {
  //                 registration.unregister();
  //             });
  //         });
  //     }
  // });
    
    await page.route('**/*', async (route) => {
        const request = route.request();
        let url = request.url();
      //  console.log('request url:', url);

        if (url.includes('/2/grok/add_response.json')&&request.method()==='POST') {
              console.log('request url:', url);
             // await route.abort();
            
            // 处理 OPTIONS 预检请求
            // if (request.method() === 'OPTIONS') {
            //     await route.fulfill({
            //         status: 200,
            //         headers: {
            //             'Access-Control-Allow-Origin': 'https://you.com/',
            //             'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            //             'Access-Control-Allow-Headers': 'content-type,x-client-id,x-client-locale,x-client-type,x-client-version,x-from-channel,x-product-name,x-time-zone',
            //             'Access-Control-Max-Age': '86400',
            //             'Access-Control-Allow-Credentials': 'true'
            //         }
            //     });
            //     return;
            // }


            try {
                console.log('method:', request.method());
                // 创建 EventSource 实例
                const eventSourceOptions = {
                    method: request.method(),
                    headers: await request.allHeaders(),
                    body: request.postData(),
                    timeout: 60000
                };



                if (config.proxy) {
                    eventSourceOptions.agent = proxyAgent;
                }

                customEventSource = new CustomEventSource(url, eventSourceOptions);

                customEventSource.on('message', (event) => {
                    if (Aborted) {
                        console.log('关闭连接!');
                        
                        customEventSource.close();
                        return false;
                    }
                 //   console.log('Received event:', event);
                 //   console.log('Received message:', event.message);
                    processStreamData(event.message);
                });

                customEventSource.on('error', (error) => {
                    console.error('EventSource error:', error);
                    cleanupAndEnd('Error occurred');
                    return false;
                });

                customEventSource.on('end', (message) => {
                    console.log('Stream ended:', message);
                    cleanupAndEnd('Stream ended');
                    return false;
                });

                customEventSource.on('close', (message) => {
                    console.log('Connection closed:', message);
                    cleanupAndEnd('Connection closed');
                    return false;
                });

                return false;

            } catch (error) {
                console.error('Error intercepting request:', error);
                console.log('Client disconnected');
                Aborted = true;
                if (rrreeeqqq) {
                    resssss = null;
                }
                return false;
            }
        } else {
            // 对于其他请求，直接继续
            await route.continue();
        }
    });

    function processStreamData(message) {
        if (Aborted) {
            console.log('Request aborted, stopping data processing');
             
            return;
        }

       // console.log('数据', message);


        if (message){
            try {
              //  const parsedMessage = JSON.parse(message);
                const text = message;
                const response = {
                    id: "chatcmpl-" + Math.random().toString(36).substr(2, 9),
                    object: "chat.completion",
                    created: Date.now(),
                    model: "gpt-3.5-turbo-0613",
                    usage: {
                        prompt_tokens: 9,
                        completion_tokens: text.length,
                        total_tokens: 9 + text.length
                    },
                    choices: [{
                        delta: {
                            role: 'assistant',
                            content: text || null
                        },
                        finish_reason: null,
                        index: 0
                    }]
                };

                if (resssss) {
                    console.log('Sending response:', JSON.stringify(response));
                    if (isstream) {
                       // console.log(isstream)
                        reqmessage += text;
                        resssss.flushHeaders();
                        resssss.write(`data: ${JSON.stringify(response).replace("\\n", "\\n ")}\n\n`);
                        resssss.flushHeaders();
                    } else {
                        reqmessage += text;
                    }
                }
            } catch (error) {
                console.error('Error processing message:', error);
                console.log('Client disconnected');
                Aborted = true;
                if (rrreeeqqq) {
                    customEventSource.close();
                    resssss = null;
                }
            }
        }
    }

    function cleanupAndEnd(reason) {
        console.log(`Ending response: ${reason}`);
        if (customEventSource) {
            customEventSource.removeAllListeners();
            customEventSource.close();
        }
         
        if (resssss) {
            if (isstream) {
                if (reqmessage !== "") {
                    resssss.write(`data: [DONE]\n\n`);
                    resssss.end();
                } else {
                    resssss.write('{"error":{"message":"网络错误","type":"invalid_request_error","param":null,"code":null}}');
                    resssss.end();
                }
            } else {
                if (reqmessage !== "") {
                    const response = createChatCompletion(reqmessage);
                    resssss.write(JSON.stringify(response));
                    resssss.end();
                } else {
                    resssss.write('{"error":{"message":"网络错误","type":"invalid_request_error","param":null,"code":null}}');
                    resssss.end();
                }
            }
        }
        console.log('Response ended and resources cleaned up');
    }
    await new Promise(resolve => setTimeout(resolve, 100));
}

server.listen(config.port, () => {
    console.log(`服务器运行在 http://localhost:${config.port}`);
});
function createChatCompletion(content){
    const completionTokens = content.length;
    
    return {
        id: generateId(),
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model: "gpt-3.5-turbo",
        system_fingerprint: "fp_44709d6fcb",
        choices: [
            {
                index: 0,
                message: {
                    role: "assistant",
                    content: content
                },
                logprobs: null,
                finish_reason: "stop"
            }
        ],
        usage: {
            prompt_tokens: completionTokens,
            completion_tokens: completionTokens,
            total_tokens: completionTokens
        }
    };
};
const generateId = () => 'chatcmpl-' + Math.random().toString(36).substring(2, 15);