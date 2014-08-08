#!/usr/bin/env node

var fs          = require('fs'),
    path        = require('path'),
    config      = {
        modulePath  : 'app/module/',
        corePath    : 'app/core/',
        root        : process.cwd()
    },
    files       = {
        core:{
            css : {
                name:'app.css'
            },
            js  : {
                name:'app.js'
            },
            data: {
                name:'app.data.js'
            }
        },
        module:{
            css : {
                name:'template.css'
            },
            html: {
                name:'template.html'
            },
            js  : {
                name:'template.js'
            },
            example:{
                name:'_example.html'
            }
        }
    },
    moduleData  ={
        name    : false,
        html    : 'true',
        css     : 'true'
    };


process.stdout.write('\n\n# Welcome to the RIA App tool.\n\n>');
process.stdin.setEncoding('utf8');

process.stdin.on(
    'readable', 
    function() {
        var chunk = process.stdin.read();
        
        if (chunk !== null) {
            chunk = chunk.replace( /\s\s+/g, ' ' ).trim();
            
            var lowerChunk=chunk.toLowerCase().split(' ');
            chunk=chunk.split(' ');
            
            switch(lowerChunk[0]){
                case 'create'   :
                    switch(lowerChunk[1]){
                        case 'module' :
                            createModule(chunk,lowerChunk);
                            break;
                    }
                    break;
                case 'init'     :
                    init(chunk,lowerChunk);
                    break;
                case 'set'      :
                    setVar(chunk,lowerChunk);
                    break;
                case 'help'     :
                    help();
                    break;
            }
            
            process.stdout.write('>');
        }
    }
);


function setVar(chunk,lowerChunk){
    if(lowerChunk[1]=='root'){
        config.root=chunk[2];
        console.log('## now refrencing '+chunk[2]+' as app root')
    }
}

function init(chunk,lowerChunk){
    for(var i=1; i<lowerChunk.length; i++){
        if(lowerChunk[i].indexOf('root=')>-1){
            config.root=chunk[i].split('=')[1];
            continue;
        }
        
        if(lowerChunk[i].indexOf('modulepath=')>-1){
            config.modulePath=chunk[i].split('=')[1];
            continue;
        }
    }
    
    createNewApp();
}

function createModule(chunk,lowerChunk){
    if(
        !fs.existsSync(
            path.resolve(
                config.root,
                'app'
            )
        )
    ){
        console.log(config.root+' is not an RIA App directory. If you are not in the root of the RIA App you wish to create the module in, set your app root with the set command. type help for more info on set.')
        return;
    }
    
    if(!lowerChunk[2]){
        guidedModuleCreation();
        return;
    }
    
    moduleData.name=chunk[2];
    
    for(var i=3; i<lowerChunk.length; i++){
        if(lowerChunk[i].indexOf('no-css')){
            moduleData.css='false';
            continue;
        }
        
        if(lowerChunk[i].indexOf('no-html')){
            moduleData.html='false';
            continue;
        }
    }
    
    createNewModule();
}

function createNewModule(){
    var modulePath=path.resolve(
        config.root,
        config.modulePath+'/'+
        moduleData.name+'/'
    );
    
    if(
        fs.existsSync(
            modulePath
        )
    ){
        console.log('!!! module'+moduleData.name+' already exists, overwriting.');
    }else{
        fs.mkdirSync(
            modulePath
        );
    }
    
    for(var i=0, 
            keys=Object.keys(files.module); 
        i<keys.length; 
        i++
    ){
        var fileData={
            path: path.resolve(
                __dirname, 
                'template/app/module/template/'+
                    files.module[
                        keys[i]
                    ].name
            ),
            type: 'module',
            key : keys[i]
        }
        
        fs.readFile(
            fileData.path,
            {
                encoding:'UTF-8'
            }, 
            (
                function(fileData){
                    return function(err,data){
                        if(err){
                            failedToReadFile.apply(
                                {},
                                arguments
                            );
                        }
                        gotFile.call(
                            {},
                            fileData.path,
                            fileData.type,
                            fileData.key,
                            data
                        );
                    }
                }
            )(fileData)
        );
    }
}

function createNewApp(){
    var paths={
        app     : path.resolve(
            config.root,
            'app'
        ),
        core    : path.resolve(
            config.root,
            config.corePath
        ),
        module  : path.resolve(
            config.root,
            config.modulePath
        )
    }
    
    if(fs.existsSync(paths.app)){
        console.log('!!! app folder already exists');
    }else{
        fs.mkdirSync(
            paths.app
        );
    }
    
    if(fs.existsSync(paths.core)){
        console.log('!!! core folder already exists');
    }else{
        fs.mkdirSync(
            paths.core
        );
    }
    
    if(fs.existsSync(paths.module)){
        console.log('!!! module folder already exists');
    }else{
        fs.mkdirSync(
            paths.module
        );
    }
    
    fs.writeFile(
        path.resolve(
            config.root,
            '.config'
        ),
        JSON.stringify(config)
    );
    
    for(var i=0, 
            keys=Object.keys(files.core); 
        i<keys.length; 
        i++
    ){
        var fileData={
            path: path.resolve(
                __dirname, 
                'template/app/core/'+
                    files.core[
                        keys[i]
                    ].name
            ),
            type: 'core',
            key : keys[i]
        }
        
        fs.readFile(
            fileData.path,
            {
                encoding:'UTF-8'
            }, 
            (
                function(fileData){
                    return function(err,data){
                        if(err){
                            failedToReadFile.apply(
                                {},
                                arguments
                            );
                        }
                        gotFile.call(
                            {},
                            fileData.path,
                            fileData.type,
                            fileData.key,
                            data
                        );
                    }
                }
            )(fileData)
        );
    }
}

function failedToReadFile(err){
    console.log(
        '\n\n!!!! ERROR START !!!!\n\nUnable to load : '+
            err.path+
            '\nerrno : '+
            err.errno+
            '\ncode : '+
            err.code+
            '\n\n!!!! ERROR END !!!!\n\n'
    );
}

function gotFile(filePath,type,key,data){
    var toPath=false;
    switch(type){
        case 'core' :
            var fileName=path.basename(filePath);
            
            if(fileName=='app.js'){
                data=data.replace(/\$\{modulePath\}/g,config.modulePath)
            }
            
            toPath=path.resolve(
                config.root,
                config.corePath+'/'+
                fileName
            );
            break;
        case 'module' :
            var fileName=moduleData.name+path.extname(filePath);
            if(path.basename(filePath)=='_example.html'){
                fileName='_example.html';
                data=data.replace(/\$\{moduleName\}/g,moduleData.name)
                    .replace(/\$\{css\}/g,moduleData.css)
                    .replace(/\$\{html\}/g,moduleData.html);
            }
            toPath=path.resolve(
                config.root,
                config.modulePath+'/'+
                moduleData.name+'/'+
                fileName
            );
            break;
        default :
            console.log('\n\n!!! ERROR : file type of '+type+'not supported in gotFile function.\nFile write failed!\n\n');
            return;
    }
    
    files[type][key].data=data;
    
    //console.log(toPath,files[type][key])
    
    fs.writeFile(
        toPath,
        data
    );
    
    console.log('### Writing '+toPath);
}

function help(){
    process.stdout.write('\n\n#############################\n');
    process.stdout.write('\n\nInitialize a new app : \n');
    process.stdout.write('>init\n');
    process.stdout.write('>init root=path/to/app/dir/here/\n');
    process.stdout.write('>init modulePath=path/to/modules/here\n');
    process.stdout.write('>init root=path/to/app/dir/here/ modulePath=path/to/modules/here/\n');
    
    process.stdout.write('\n');
    process.stdout.write('Create a new module : \n');
    process.stdout.write('>create module\n');
    process.stdout.write('>create module moduleName\n');
    process.stdout.write('>create module moduleName no-css no-html\n');
    
    process.stdout.write('\n');
    process.stdout.write('Set app options : \n');
    process.stdout.write('>set root /path to my/app/root (this dir should contain the "app" folder)\n');
    process.stdout.write('#############################\n\n');
}