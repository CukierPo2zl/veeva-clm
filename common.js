const { exec } = require('child_process');
const fs = require('fs');
const archiver = require('archiver');
const environment = require('./configuration/environment');


const SOURCE = environment.paths.output;

const SHARED_RESOURCES = 'CLM_Shared_Resources';

const SHARED_RESOURCES_ADDRESS = './shared';

const HTML_ELEMENTS = {
    SPLIT: '<',
    SCRIPT: {
        start: 'script',
        source: 'src="'
    },
    LINK: {
        start: 'link',
        source: 'href="'
    },
};

function useViews() {

    const directories = source =>
        fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

    const getHTMLfile = source =>
        fs.readFileSync(`${SOURCE}/${source}/${source}.html`, 'utf8');

    const writeToHTLMfile = (view, content) =>
        fs.writeFileSync(`${SOURCE}/${view}/${view}.html`, content);

    const removeViewDir = view => {
        const path = `${SOURCE}/${view}`;
        fs.rmdirSync(path, { recursive: true });
    }

    const zipView = view => {
        const path = `${SOURCE}/${view}`;
        const output = fs.createWriteStream(`${path}.zip`)
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
            removeViewDir(view)
        });

        archive.on('error', function (err) {
            throw err;
        });

        archive.pipe(output);

        archive.directory(path, view);

        archive.finalize();
    }

    return [directories(SOURCE), getHTMLfile, writeToHTLMfile, zipView, removeViewDir];
}


function makePathsRelative(view) {

    const [, getHTMLfile, writeToHTLMfile] = useViews();
    const file = getHTMLfile(view);

    // make changes global
    const re = element => new RegExp(`${element}`, 'g');

    const linkElement = el => re(`${HTML_ELEMENTS.LINK.source}/${el}`)
    const scriptElement = el => re(`${HTML_ELEMENTS.SCRIPT.source}/${el}`)

    const viewLinkReg = linkElement(view);
    const viewScriptReg = scriptElement(view);

    const sharedReg = re(`(\\..)?/${SHARED_RESOURCES}`)
    const dirtyReg = re(`./shared/${SHARED_RESOURCES}/css./shared/${SHARED_RESOURCES}.css`); // stupid but works

    const formatRelativePath = path => `${path}.`

    const sharedDestination = `${SHARED_RESOURCES_ADDRESS}/${SHARED_RESOURCES}`;
    const content = file
        .replace(viewLinkReg, formatRelativePath(HTML_ELEMENTS.LINK.source))
        .replace(viewScriptReg, formatRelativePath(HTML_ELEMENTS.SCRIPT.source))
        .replace(sharedReg, sharedDestination)
        .replace(dirtyReg, `./shared/${SHARED_RESOURCES}/css/${SHARED_RESOURCES}.css`)

    try {
        writeToHTLMfile(view, content);
    } catch (err) {
        console.error(err);
    }
}

exec("webpack --config configuration/webpack.prod.config.js --mode=development", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
    }
    const [directories, , , zipView] = useViews();
    console.log(`${stdout}`);

    directories.forEach(view => {
        process.stdout.write(view + ' ...... ');
        makePathsRelative(view);
        zipView(view);
        console.log('\x1b[32m', 'Done');
        console.log('\x1b[0m');
    })

    console.log(`${directories.length} key messages ready for deploy`);

});