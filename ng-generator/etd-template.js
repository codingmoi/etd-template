const shell =  require('shelljs');
const generator = require('./generator.module');

if (shell.which('git')) {
    shell.echo('Starting Code Generator...');
    generator.start();
} else {
    shell.echo('Git is not installed');
}