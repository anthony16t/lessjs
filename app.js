import {Less} from './lessjs/less.js'
let less = new Less(document)

let siteName = 'LessJs'
let currentVersion = 0.2

less.run({
    homePageTitle:siteName,
    version:currentVersion
})