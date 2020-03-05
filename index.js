const electron = require('electron');
const url = require('url');
const path = require('path');


const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;
let addExpenseWindow;


//TODO: set somewhere else??
//process.env.NODE_ENV = 'production';

// app on ready 

app.on('ready', ()=> {
    // create window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });

    // load html for the window
    // passes: file://dirname/mainWindow.html
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on('closed', () => { app.quit(); });

    // create and add menu
    const mainMenu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(mainMenu);

});


// add expense window

function openAddExpenseWindow(){
    addExpenseWindow = new BrowserWindow({
        width: 300,
        height: 280,
        webPreferences: {
            nodeIntegration: true
        }
    });

    // load html for the window
    // passes: file://dirname/mainWindow.html
    addExpenseWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addExpenseWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // gc handle when closed
    addExpenseWindow.on('close', ()=>{
        addExpenseWindow = null;
    });
}

// receive payload from popup
ipcMain.on('expense:add', (e, payload) => {
    console.log(payload);
    mainWindow.webContents.send('expense:add', payload);
    addExpenseWindow.close();
});

// create menu
const menuTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add expense',
                click(){
                    openAddExpenseWindow();
                }
            },
            {
                label: 'Clear all',
                click(){
                    mainWindow.webContents.send('expense:clear');
                }
            },
            {
                label: 'Save as a csv'
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'win32' ? 'Ctrl+Q' : 'Command+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
]

// if mac, add empty object on the beginning of the array
if(process.platform == 'darwin'){
    menuTemplate.unshift({});
    console.log(menuTemplate);
}

// add dev tools if not prod
if(process.env.NODE_ENV !== 'production'){
    menuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'win32' ? 'Ctrl+I' : 'Command+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'Reload'
            }
        ]
    })
}
