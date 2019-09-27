// object - coverage - project - package - file

class Metric {
    constructor(name, loc, ncloc, methods, coveredMethods, statements, coveredStatements, conditionals, coveredConditionals) {
        this.name = name;
        this.loc = parseInt(loc);
        this.ncloc = parseInt(ncloc);
        this.methods = parseInt(methods);
        this.coveredMethods = parseInt(coveredMethods);
        this.stmt = parseInt(statements);
        this.coveredStmt = parseInt(coveredStatements);
        this.conditionals = parseInt(conditionals);
        this.coveredConditionals = parseInt(coveredConditionals);
        let tpcNum = (this.coveredConditionals + this.coveredStmt + this.coveredMethods);
        let tpcDenom = (2 * this.conditionals) + this.stmt + this.methods;
        let overallCoverage = tpcDenom > 0
            ? tpcNum / tpcDenom * 100
            : -1;
        this.overallCoverage = overallCoverage;
    }
    
    serialize() {
        let statementCoverage = this.stmt > 0
            ? this.coveredStmt / this.stmt * 100
            : -1;
        let methodCoverage = this.methods > 0
            ? this.coveredMethods / this.methods * 100
            : -1;
        return {
            name: this.name,
            loc: this.loc,
            methods: this.methods,
            coveredMethods: this.coveredMethods,
            stmt: this.stmt,
            coveredStmt: this.coveredStmt,
            methodCoverage: methodCoverage,
            statementCoverage: statementCoverage,
            overallCoverage: this.overallCoverage,
        }
    }
}

class FileCoverage {
    constructor(name, loc, ncloc, methods, coveredMethods, stmt, coveredStmt, conditionals, coveredConditionals) {
        this.metrics = new Metric(name, loc, ncloc, methods, coveredMethods, stmt, coveredStmt, conditionals, coveredConditionals);
    }

    serialize() {
        return this.metrics.serialize();
    }
}

class NamespaceItem {
    constructor(name) {
        this.name = name;
        this.files = [];
        this.loc = 0;
        this.ncloc = 0;
        this.methods = 0;
        this.coveredMethods = 0;
        this.stmt = 0;
        this.coveredStmt = 0;
        this.conditionals = 0;
        this.coveredConditionals = 0;
    }

    addFile(fileName, loc, ncloc, method, coveredMethods, stmt, coveredStmt, conditionals, coveredConditionals) {
        this.files.push(new FileCoverage(fileName, loc, ncloc, method, coveredMethods, stmt, coveredStmt, conditionals, coveredConditionals));
        this.loc += parseInt(loc);
        this.ncloc += parseInt(ncloc);
        this.methods += parseInt(method);
        this.coveredMethods += parseInt(coveredMethods);
        this.stmt += parseInt(stmt);
        this.coveredStmt += parseInt(coveredStmt);
        this.conditionals += parseInt(conditionals);
        this.coveredConditionals += parseInt(coveredConditionals);
        let tpcNum = (this.coveredConditionals + this.coveredStmt + this.coveredMethods);
        let tpcDenom = (2 * this.conditionals) + this.stmt + this.methods;
        let overallCoverage = tpcDenom > 0
            ? tpcNum / tpcDenom * 100
            : -1;
        this.overallCoverage = overallCoverage;
    }

    serialize() {
        let statementCoverage = this.stmt > 0
            ? this.coveredStmt / this.stmt * 100
            : -1;
        let methodCoverage = this.methods > 0
            ? this.coveredMethods / this.methods * 100
            : -1;
        let serializedFiles = [];
        this.files.forEach((file) => {
            serializedFiles.push(file.serialize());    
        })
        return {
            files: serializedFiles,
            name: this.name,
            loc: this.loc,
            ncloc: this.ncloc,
            methods: this.methods,
            coveredMethods: this.coveredMethods,
            stmt: this.stmt,
            coveredStmt: this.coveredStmt,
            methodCoverage: methodCoverage,
            statementCoverage: statementCoverage,
            overallCoverage: this.overallCoverage,
        }
    }
}

function compare(a, b) {
    if (a.overallCoverage === -1) {
        return -1;
    }
    return a.overallCoverage > b.overallCoverage ? 1 : -1;
}

let parseXml = {
    parseXml(xmlString) {
        return xmlString;
    },

    parseXmlFromFile(file, callback) {
        if (window.DOMParser) {
            var reader = new FileReader();
            reader.onload = function(event) {
                let doc = new DOMParser().parseFromString(event.target.result, 'application/xml');
                let elements = doc.getElementsByTagName('package');
                let namespaces = [];
                let filesCount = 0;
                let namespacesCount = elements.length;
                let ignoredNamespaces = 0;
                let ignoredFiles = 0;
                for (let i = 0; i < elements.length; ++i) {
                    let namespaceItem = new NamespaceItem(elements[i].getAttribute('name'));
                    let childs = elements[i].getElementsByTagName('file');
                    filesCount += childs.length;
                    let countOfIgnoredFiles = 0;
                    for (let i = 0; i < childs.length; ++i) {
                        let file = childs[i].getAttribute('name');
                        // only get the direct child of file
                        let directChildren = childs[i].childNodes;
                        for (let i = 0; i < directChildren.length; ++i) {
                            if (directChildren[i].tagName === 'metrics') {
                                let metric = directChildren[i];
                                if (parseInt(metric.getAttribute('statements')) < 1) {
                                    countOfIgnoredFiles += 1;
                                    ignoredFiles += 1;
                                }
                                namespaceItem.addFile(
                                    file,
                                    metric.getAttribute('loc'),
                                    metric.getAttribute('ncloc'),
                                    metric.getAttribute('methods'),
                                    metric.getAttribute('coveredmethods'),
                                    metric.getAttribute('statements'),
                                    metric.getAttribute('coveredstatements'),
                                    metric.getAttribute('conditionals'),
                                    metric.getAttribute('coveredconditionals'),
                                );
                            }
                        }
                    }
                    if (countOfIgnoredFiles === childs.length) {
                        ignoredNamespaces += 1;
                    }
                    namespaces.push(namespaceItem);
                }
                let project = doc.getElementsByTagName('project');
                let loc, ncloc, methods, coveredMethods, statements, coveredStatements, conditionals, coveredConditionals;
                project[0].childNodes.forEach((child) => {
                    if (child.tagName === 'metrics') {
                        let metric = child;
                        loc = parseInt(metric.getAttribute('loc'));
                        ncloc = parseInt(metric.getAttribute('ncloc'));
                        methods = parseInt(metric.getAttribute('methods'));
                        coveredMethods = parseInt(metric.getAttribute('coveredmethods'));
                        statements = parseInt(metric.getAttribute('statements'));
                        coveredStatements = parseInt(metric.getAttribute('coveredstatements'));
                        conditionals = parseInt(metric.getAttribute('conditionals'));
                        coveredConditionals = parseInt(metric.getAttribute('coveredconditionals'));
                    }
                })
                namespaces.sort(compare);
                let serializedNamespaces = [];
                namespaces.forEach((item) => {
                    serializedNamespaces.push(item.serialize());
                });
                let statementCoverage = statements > 0
                    ? coveredStatements / statements * 100
                    : -1;
                let methodCoverage = methods > 0
                    ? coveredMethods / methods * 100
                    : -1;
                let tpcNum = (coveredConditionals + coveredStatements + coveredMethods);
                let tpcDenom = (2 * conditionals) + statements + methods;
                let overallCoverage = tpcDenom > 0
                    ? tpcNum / tpcDenom * 100
                    : -1;
                callback({
                    metrics: {
                        filesCount: filesCount,
                        namespacesCount: namespacesCount,
                        ignoredFiles: ignoredFiles,
                        ignoredNamespaces: ignoredNamespaces,

                        linesOfCodes: loc,
                        nonCommentLinesOfCode: ncloc,
                        statementCoverage: statementCoverage,
                        methodCoverage: methodCoverage,
                        overallCoverage: overallCoverage,
                    },
                    namespaces: serializedNamespaces
                });
            };
            reader.readAsText(file);
        } else {
            throw Error('No XML Parser found.');
        }
    }
};

export default parseXml;
