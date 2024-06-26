import puppeteer, {Page} from "puppeteer";
import { timeout } from "~/utils";
import { v4 as uuidv4 } from 'uuid'
import {captchaCache, errRet, sucRet} from "~/server/utils";

//node headless浏览器渲染验证码图片

let browser:any;
puppeteer.launch({ headless : true }).then(res=>browser=res);//headless:false 预览渲染过程
export default defineEventHandler(async (event) => {

    let ts = Date.now();
    function logTime(tip:string){
        console.log(`${tip}耗时`,Date.now()-ts);
        ts = Date.now();
    }
    // const browser = await puppeteer.launch({ headless : true })//
    if(!browser)return errRet(event,'未初始化');
    const page = await browser.newPage();
    await page.goto(`http://localhost:3000/render`);
    logTime('打开页面')
    let ret:any
    page.on('console', (msg:any) => {
        try{
            // console.log('捕获事件',msg.text())
            const call = JSON.parse(msg.text())
            if(!call?.event)return;
            switch (call.event){
                case 'render-end':
                    ret = call.data;
                    break;
            }
        }catch (e){
            //console.log('异常',e)
        }
    });

    let time = 0
    while (!ret){
        await timeout(50);
        time+=50;
        if(time>=7000){
            await page.close()
            return errRet(event,'生成超时');//生成超时
        }
    }
    logTime('生成成功')
    await page.close()
    logTime('关闭页面')
    ret = { id:uuidv4() , ...ret }
    captchaCache.set(ret.id,ret);//验证码信息存到内存 生产存到redis或数据库
    return sucRet(event,{ ...ret , sureIndex:null });
})

