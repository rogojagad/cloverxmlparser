<template>
  <div class="container">
    <div class="columns">
      <div class="column">
        <b-field class="file">
            <b-upload v-model="file">
                <a class="button is-primary">
                    <b-icon icon="upload"></b-icon>
                    <span>Click to select file</span>
                </a>
            </b-upload>
            <span class="file-name" v-if="file">
                {{ file.name }}
            </span>
        </b-field>
      </div>
      <div class="column">
        <b-button type="is-info" @click="readXmlFromFile">Parse XML</b-button>
      </div>
    </div>
    <div v-if="items" class="container">
      <div>
        <div class="columns">
          <div class="column">
            <b-switch v-if="items" v-model="showSkipped">
              Show Skipped
            </b-switch>
            <b-switch v-if="items" v-model="showPerfect">
              Show 100% Coverage
            </b-switch>
          </div>
          <div class="column">
            <p class="centerbold">Legend:</p>
            <p class="health-dangerous">0 - 49%</p>
            <p class="health-warning">50 - 90%</p>
            <p class="health-decent">91 - 95%</p>
            <p class="health-good">95 - 99%</p>
            <p class="health-perfect">100%</p>
          </div>
        </div>
      </div>
      <hr>
      <h1 class="title">Project Metrics</h1>
      <div>
        <b-table :data="metrics">
          <template slot-scope="props">
            <b-table-column field="linesOfCodes" label="Lines of Code">
              {{ props.row.linesOfCodes }}
            </b-table-column>
            <b-table-column field="nonCommentLinesOfCode" label="Non-Comment Lines of Code">
              {{ props.row.nonCommentLinesOfCode }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.statementCoverage)" field="statementCoverage" label="Statement Coverage">
              {{ toString(props.row.statementCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.methodCoverage)" field="methodCoverage" label="Method Coverage">
              {{ toString(props.row.methodCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" field="overallCoverage" label="Overall Coverage">
              {{ toString(props.row.overallCoverage) }}
            </b-table-column>
          </template>
        </b-table>
        <hr>
        <b-table :data="metrics">
          <template slot-scope="props">
            <b-table-column field="filesCount" label="Files Count">
              {{ props.row.filesCount }}
            </b-table-column>
            <b-table-column field="namespacesCount" label="Namespaces Count">
              {{ props.row.namespacesCount }}
            </b-table-column>
            <b-table-column field="ignoredFiles" label="Ignored Files">
              {{ props.row.ignoredFiles }}
            </b-table-column>
            <b-table-column field="ignoredNamespaces" label="Ignored Namespaces">
              {{ props.row.ignoredNamespaces }}
            </b-table-column>
            <b-table-column field="totalFiles" label="Total Files">
              {{ props.row.filesCount - props.row.ignoredFiles }}
            </b-table-column>
            <b-table-column field="totalNamespaces" label="Total Namespaces">
              {{ props.row.namespacesCount - props.row.ignoredNamespaces }}
            </b-table-column>
          </template>
        </b-table>
        <hr>
        <b-table :data="metrics">
          <template slot-scope="props">
            <b-table-column field="filesBelowNinety" label="Files Below 90% Count">
              {{ props.row.filesBelowNinety }} {{ `(${countPercentage(props.row.filesBelowNinety, props.row.filesCount)}%)` }}
            </b-table-column>
            <b-table-column field="filesBelowNinetyFive" label="Files Below 95% Count">
              {{ props.row.filesBelowNinetyFive }} {{ `(${countPercentage(props.row.filesBelowNinetyFive, props.row.filesCount)}%)` }}
            </b-table-column>
            <b-table-column field="namespacesBelowNinety" label="Namespaces Below 90% Count">
              {{ props.row.namespacesBelowNinety }} {{ `(${countPercentage(props.row.namespacesBelowNinety, props.row.filesCount)}%)` }}
            </b-table-column>
            <b-table-column field="namespacesBelowNinetyFive" label="Namespaces Below 95% Count">
              {{ props.row.namespacesBelowNinetyFive }} {{ `(${countPercentage(props.row.namespacesBelowNinetyFive, props.row.filesCount)}%)` }}
            </b-table-column>
          </template>
        </b-table>
      </div>
      <hr>
      <h1 class="title">Group by Namespace ({{countCheckSkipAndPerfect(this.items)}})</h1>
      <div>
        <b-table :data="items">
          <template slot-scope="props">
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="name" label="Package Name">
              {{ props.row.name }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="methodCoverage" label="Method Coverage">
              {{ toString(props.row.methodCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="statementCoverage" label="Statement Coverage">
              {{ toString(props.row.statementCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="overallCoverage" label="Overall Coverage">
              {{ toString(props.row.overallCoverage) }}
            </b-table-column>
          </template>
        </b-table>
      </div>
      <hr>
      <h1 class="title">Specific Files ({{countCheckSkipAndPerfect(this.fileItems)}})</h1>
      <div>
        <b-table :data="fileItems">
          <template slot-scope="props">
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="name" label="Package Name">
              {{ props.row.name }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="methodCoverage" label="Method Coverage">
              {{ toString(props.row.methodCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="statementCoverage" label="Statement Coverage">
              {{ toString(props.row.statementCoverage) }}
            </b-table-column>
            <b-table-column v-bind:class="selectClass(props.row.overallCoverage)" v-if="shouldShow(props.row.overallCoverage)" field="statementCoverage" label="Overall Coverage">
              {{ toString(props.row.overallCoverage) }}
            </b-table-column>
          </template>
        </b-table>
      </div>
    </div>
  </div>
</template>

<script>
import parseXml from '@/scripts/readxml';

export default {
  name: 'HelloWorld',

  data() {
    return {
      file: null,
      items: null,
      metrics: null,
      fileItems: null,
      showSkipped: false,
      showPerfect: false,
    }
  },

  methods: {
    readXmlFromFile() {
      if (this.file) {
        parseXml.parseXmlFromFile(this.file, (items) => {
          this.items = items.namespaces;
          this.fileItems = this.stripAllFilesFromData(items.namespaces);
          this.metrics = [{
            ...items.metrics,
            filesBelowNinety: this.itemsBelow(this.fileItems, 90),
            filesBelowNinetyFive: this.itemsBelow(this.fileItems, 95),
            namespacesBelowNinety: this.itemsBelow(items.namespaces, 90),
            namespacesBelowNinetyFive: this.itemsBelow(items.namespaces, 95),
          }];
        });
      } else {
        this.$buefy.notification.open({
            duration: 5000,
            message: 'No file has been selected yet.',
            position: 'is-bottom-right',
            type: 'is-danger',
            hasIcon: true
        })
      }
    },
    itemsBelow(items, threshold) {
      let count = 0;
      items.forEach((item) => {
        if (item.overallCoverage > 0 && item.overallCoverage < threshold) {
          count += 1;
        }
      });
      return count;
    },
    countPercentage(current, total) {
      return Math.round(((current / total) * 100) * 100) / 100;
    },
    countCheckSkipAndPerfect(items) {
      let count = 0;
      items.forEach((item) => {
        if (item.overallCoverage >= 100 && !this.showPerfect) {
          return;
        }
        if (item.overallCoverage < 0 && !this.showSkipped) {
          return;
        }
        count += 1;
      });
      return count;
    },
    stripAllFilesFromData(items) {
      let files = [];
      items.forEach((item) => {
        let internalFiles = item.files;
        internalFiles.forEach((file) => {
          files.push(file);
        })
      });
      files.sort((a, b) => {
        if (a.overallCoverage === -1) {
            return -1;
        }
        return a.overallCoverage > b.overallCoverage ? 1 : -1;
      });
      return files;
    },
    toString(value) {
      return value >= 0 ? `${Math.round(value * 100) / 100}%` : 'SKIPPED' 
    },
    selectClass(coverage) {
      if (coverage < 0) {
        return 'health-skipped';
      }
      if (coverage < 50) {
        return 'health-dangerous';
      }
      if (coverage < 90) {
        return 'health-warning';
      }
      if (coverage < 95) {
        return 'health-decent';
      }
      if (coverage < 100) {
        return 'health-good';
      }
      return 'health-perfect';
    },
    shouldShow(coverage) {
      if (coverage < 0) {
        return this.showSkipped;
      }
      return coverage < 100 || this.showPerfect;
    }
  }
}
</script>

<style scoped>
.container {
  margin-top: 2%;
}

.health-skipped {
  background: grey;
  color: black;
}

.health-dangerous {
  background: #b50000;
  color: white;
}

.health-warning {
  background: yellow;
  color: black;
}

.health-decent {
  background: #beff4f;
  color: black;
}

.health-good {
  background: #00ff00;
  color: black;
}

.health-perfect {
  background: #00ff00;
  color: black;
  font-weight: bold;
}

.centerbold {
  font-weight: bolder;
  text-align: center;
}
</style>
