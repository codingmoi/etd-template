const shell =  require('shelljs');
const inquirer = require('inquirer');
const replace = require('replace-in-file');
const fs = require('fs');

const currDir = process.cwd();
const templateName = 'mat-app2';
const regexTemp = new RegExp(templateName, 'g');

const repoName = 'etd-template';
const repoUrl = 'https://github.com/moilearn/etd-template.git'; //'https://ryder-vsts.visualstudio.com/SolutionArchitects/_git/SARepo';
const branchName = 'master' //'pocDotNetCoreWebApi';

const sourcePath = `${repoName}\\mat-app2`; //'SARepo\\Archetypes\\Template - Angular Material\\mat-app2';

const PARAMS = [
    {
        name: 'project-name',
        type: 'input',
        message: 'Project name:',
        validate: function (input) {
            if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
            else return 'Project name may only include letters, numbers, underscores and hashes.';
        }
    },
    {
        name: 'project-description',
        type: 'input',
        message: 'Project description:'
    }
];

function start() {
    cloneRepo().then(() => {
        return readParams();
    }).then((data) => {
        return templating(data.projectName, data.projectDescription);
    }).then((projectName) => {
        return copyProject(projectName);
    }).then(() => {
        return removeRepo();
    }).catch(error => _error(error));
}

function cloneRepo() {
    return new Promise((resolve, reject) => {
        if (fs.exists(repoName)) {
            reject(`${repoName} directory already exists`);
        }                
        if (shell.exec(`git clone ${repoUrl}`).code == 0) {
            if (branchName == 'master') {
                resolve();
            } else {
                shell.echo('Switching to branch...');
                if (shell.cd(`${repoName}`).code == 0) {                    
                    if (shell.exec(`git checkout ${branchName}`).code == 0) {
                        resolve();
                    } else {
                        reject(`Branch ${branchName} not found`);
                    }
                } else {
                    reject('Repo not found');
                }
            }
        } else {
            reject('Git clone failed');
        }    
    });
}

function readParams() {
    return new Promise((resolve, reject) => {
        inquirer.prompt(PARAMS).then(answers => {
            resolve({
                projectName: answers['project-name'], 
                projectDescription: answers['project-description']
            });
        }).catch(error => reject(error));    
    });
}

function templating(projectName, projectDescription) {
    return new Promise((resolve, reject) => {
        shell.echo('Generating the project...');      
        const source = `${currDir}/${sourcePath}`;
        try {
            replace.sync({
                files:[`${source}/package.json`, 
                    `${source}/.angular-cli.json`,
                    `${source}/e2e/app.e2e-spec.ts`],
                from: regexTemp,
                to: projectName,
            });
            replace.sync({
                files:[`${source}/src/app/app.component.ts`],
                from: regexTemp,
                to: projectDescription,
            });
            resolve(projectName);
        } catch (error) {
            reject(error);            
        }
    });
}

function copyProject(projectName) {
    return new Promise((resolve, reject) => {
        const source = `${currDir}\\${sourcePath}`;
        const dest = `${currDir}\\${projectName}`;    
        if (fs.exists(projectName)) {
            reject(`${projectName} directory already exists`);
        }
        if (shell.cp('-r', source, dest) == 0) {
            resolve();
        } else {
            reject('Directory copy failed');
        }
    });
}

function removeRepo() {
    return new Promise((resolve, reject) => {
        shell.echo('Cleaning up temporaly stuff...');
        if (shell.rm('-rf', repoName).code == 0) {
            resolve();
        } else {
            reject('Directory erase failed');
        }        
    });
}

function _error(msg) {
    shell.echo(`ERROR: ${msg}.`);
    shell.exit(1);
}

module.exports = {
    start: start
};

