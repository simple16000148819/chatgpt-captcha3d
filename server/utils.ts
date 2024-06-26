
export const sucRet = (event:any,data:any)=>{
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    event.node.res.statusCode = 200;
    return { suc:true , data }
}


export const errRet = (event:any,msg:any)=>{
    event.node.res.setHeader('Content-Type', 'application/json; charset=utf-8');
    event.node.res.statusCode = 200;
    return { suc:false , msg }
}


export const captchaCache = new Map();