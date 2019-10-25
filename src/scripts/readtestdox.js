/* eslint-disable no-console */
function isEmptyString(value) {
    return value === undefined || value === null || value === '';
}

function minOf(a, b) {
    return a > b ? b : a;
}

function maxOf(a, b) {
    return a < b ? b : a;
}

class TestMethod {
    constructor(className, methodName, time) {
        this.className = className;
        this.methodName = methodName;
        this.time = time;
    }

    serialize() {
        return {
            class: this.className,
            name: this.methodName,
            time: this.time,
        };
    }
}

class TestClass {
    constructor(className) {
        this.className = className;
        this.tests = [];
        this.totalTime = 0;
    }

    addTest(test) {
        this.totalTime += test.time;
        this.tests.push(test);
    }

    serialize() {
        let testArray = [];
        this.tests.forEach((test) => {
            testArray.push(test.serialize());
        });
        return {
            className: this.className,
            tests: testArray,
            testCount: testArray.length,
            totalTime: this.totalTime,
        };
    }
}

function compare(a, b) {
    return a.time < b.time ? 1 : -1;
}

class TestClassReport {
    constructor(testClasses) {
        this.testClasses = testClasses;
        this.methodsTested = 0;
        this.classesTested = testClasses.length;
        this.averageTime = 0;
        this.maxTime = -Infinity;
        this.minTime = Infinity;
    }
    
    serialize() {
        let totalTime = 0;
        let serializedTests = [];
        this.testClasses.forEach((testClass) => {
            testClass = testClass.serialize();
            this.methodsTested += testClass.tests.length;
            totalTime += testClass.totalTime;

            this.minTime = minOf(this.minTime, testClass.totalTime);
            this.maxTime = maxOf(this.maxTime, testClass.totalTime);
            serializedTests.push(testClass);
        });
        this.averageTime = totalTime / this.testClasses.length;
        return {
            summary: {
                averageTime: this.averageTime,
                classesTested: this.classesTested,
                methodsTested: this.methodsTested,
                totalTime: totalTime,
                minTime: this.minTime,
                maxTime: this.maxTime,
            },
            tests: serializedTests,
        };
    }
}

class TestMethodReport {
    constructor(testMethods, classCount) {
        this.testMethods = testMethods;
        this.methodsTested = testMethods.length;
        this.classCount = classCount;
        this.averageTime = 0;
        this.maxTime = -Infinity;
        this.minTime = Infinity;
    }

    serialize() {
        let totalTime = 0;
        let serializedTests = [];
        
        this.testMethods.forEach((testMethod) => {
            totalTime += testMethod.time,
            this.minTime = minOf(this.minTime, testMethod.time);
            this.maxTime = maxOf(this.maxTime, testMethod.time);
            serializedTests.push(testMethod.serialize());
        });
        this.averageTime = totalTime / this.methodsTested;
        return {
            summary: {
                averageTime: this.averageTime,
                classesTested: this.classCount,
                maxTime: this.maxTime,
                minTime: this.minTime,
                totalTime: totalTime,
                methodsTested: this.methodsTested,
            },
            tests: serializedTests,
        }
    }
}

function parseTime(line) {
    let value = line.match(/\[(.*?)\]/);
    value = value[1].split('\\s+')[0];
    return parseFloat(value);
}

let parseTestdox = {
    parseTestdoxGrouped(file, callback) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
            let lines = this.result.split('\n');
            let currentFile = null;

            let compiledTests = [];
            for (let i = 0; i < lines.length; ++i) {
                // Empty lines will denote a change in the current class processed.
                if (isEmptyString(lines[i])) {
                    if (currentFile) {
                        currentFile.tests.sort(compare);
                        compiledTests.push(currentFile);
                    }
                    currentFile = null;
                    continue;
                }
                if (!currentFile) {
                    currentFile = new TestClass(lines[i]);
                    continue;
                } else {
                    currentFile.addTest(new TestMethod(
                        currentFile,
                        lines[i].substr(0, lines[i].lastIndexOf('[')).trim(),
                        parseTime(lines[i]))
                    );
                }
            }
            compiledTests.sort((a, b) => {
                return a.totalTime < b.totalTime ? 1 : -1;
            });
            callback(new TestClassReport(compiledTests).serialize());
        }
    },

    parseTestdoxSingular(file, callback) {
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function() {
            let lines = this.result.split('\n');
            let currentFile = null;

            let compiledTests = [];
            let classCount = 0;
            for (let i = 0; i < lines.length; ++i) {
                // Empty lines will denote a change in the current class processed.
                if (isEmptyString(lines[i])) {
                    currentFile = null;
                    classCount += 1;
                    continue;
                }
                if (!currentFile) {
                    currentFile = new TestClass(lines[i]);
                    continue;
                } else {
                    compiledTests.push(new TestMethod(
                        currentFile,
                        lines[i].substr(0, lines[i].lastIndexOf('[')).trim(),
                        parseTime(lines[i]))
                    );
                }
            }
            compiledTests.sort(compare);
            callback(new TestMethodReport(compiledTests, classCount).serialize());
        }
    }
};

export default parseTestdox;
