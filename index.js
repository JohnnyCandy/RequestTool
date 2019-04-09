const Koa = require('koa'); 
const Router = require('koa-router'); 
const app = new Koa();  
const router = Router(); 
const bodyParser = require('koa-bodyparser'); 
const md5 = require('MD5');  
const forge = require('node-forge');
const request = require('request');
router.get('/', async(ctx) => {     
    ctx.body = `     
        <form method="POST" action="/">             
            <label>Method</label>         
            <input name="method" style="width:1000px"/><br/>
            <label>URL</label>         
            <input name="url" style="width:1000px"/><br/>  
            <label>Token</label>         
            <input name="token" style="width:1000px"/><br/>
            <label>Key</label>         
            <input name="key" style="width:1000px"/><br/>            
            <button type="submit">submit</button>       
        </form>     
    `; 
});
router.post('/', async(ctx) => {     
    let method = ctx.request.body.method + '&token=' + ctx.request.body.token;
    let url = ctx.request.body.url;
    let key = ctx.request.body.key;
    let MD5 = md5(method + '&' + key).toUpperCase();
    let DES = encrypt(method + '&sign=' + MD5,key);
    let result = '';
    request.post(
        url+'/api?'+DES,
        { json: { key: 'value' } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                result = body;
                // result = decrypt(body,key); //待完成
            }
            else {
                result = "Post Error"; //待完成    
            }
        }
    );
    ctx.body = `
        <form method="POST" action="/">     
            <label>Method:</label>
            <label>${method}</label><br/>        
            <label>MD5:</label> 
            <label>${MD5}</label><br/>  
            <label>DES:</label> 
            <label>${DES}</label><br/> 
            <label>result:</label> 
            <label>${result}</label>
        </form>
    `; 
});
// openssl enc -des3 -in input.txt -out input.enc
function encrypt(password,key) {
    var input = password;
   
    // DES key and IV sizes
    var keySize = 24;
    var ivSize = 0;
   
    // get derived bytes
    // Notes:
    // 1. If using an alternative hash (eg: "-md sha1") pass
    //   "forge.md.sha1.create()" as the final parameter.
    // 2. If using "-nosalt", set salt to null.
    var salt = forge.random.getBytesSync(8);
    // var md = forge.md.sha1.create(); // "-md sha1"
    var derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize/*, md*/);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = key;
    var iv = buffer.getBytes(ivSize);
   
    var cipher = forge.cipher.createCipher('DES-ECB', key);
    cipher.start({iv: iv});
    cipher.update(forge.util.createBuffer(input, 'binary'));
    cipher.finish();
    var encrypted = cipher.output;
    return encrypted.toHex();
}
// openssl enc -d -des3 -in input.enc -out input.dec.txt
function decrypt(password,key) {
    var input = password;
    
    // parse salt from input
    input = forge.util.createBuffer(input, 'binary');
    // read 8-byte salt
    var salt = forge.random.getBytesSync(8);
    // Note: if using "-nosalt", skip above parsing and use
    // var salt = null;
   
    // DES key and IV sizes
    var keySize = 24;
    var ivSize = 0;
   
    var derivedBytes = forge.pbe.opensslDeriveBytes(
      password, salt, keySize + ivSize);
    var buffer = forge.util.createBuffer(derivedBytes);
    var key = key;
    var iv = buffer.getBytes(ivSize);
   
    var decipher = forge.cipher.createDecipher('DES-ECB', key);
    decipher.start({iv: iv});
    decipher.update(input);
    decipher.finish(); // check 'result' for true/false
    var decrypted = decipher.output;
    return decrypted.toHex();
  }
app.use(bodyParser());
app.use(router.routes());  
app.listen(3001);