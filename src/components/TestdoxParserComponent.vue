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
                <b-field class="analyze">
                    <b-button type="is-info" @click="analyzeTestdoxFile">Analyze Testdox File</b-button>
                </b-field>
                <b-field class="grouped">
                    <b-checkbox v-model="grouped">Group Results</b-checkbox>
                </b-field>
            </div>
        </div>
        <div v-if="reportData" class="container">
            <div class="container">
                <b-switch v-model="showPackage">
                    Show Full Package Name
                </b-switch>
            </div>

            <!-- Summary -->
            <h1 class="title">Testdox Summary</h1>
            <div>
                <b-table :data="summary">
                    <template slot-scope="props">
                        <b-table-column field="averageTime" label="Average Time Elapsed">
                            {{ toString(props.row.averageTime, 1000, 's') }}
                        </b-table-column>
                        <b-table-column field="maxTime" label="Maximum Time Elapsed">
                            {{ toString(props.row.maxTime, 1000, 's') }}
                        </b-table-column>
                        <b-table-column field="minTime" label="Minimum Time Elapsed">
                            {{ toString(props.row.minTime, 1000, 's') }}
                        </b-table-column>
                        <b-table-column field="totalTime" label="Total Time Elapsed">
                            {{ toString(props.row.totalTime, 3600000, 'h') }}
                        </b-table-column>
                        <b-table-column field="Methods Tested" label="Total Methods Tested">
                            {{ props.row.methodsTested }}
                        </b-table-column>
                        <b-table-column field="Classes Tested" label="Total Classes Tested">
                            {{ props.row.classesTested }}
                        </b-table-column>
                    </template>
                </b-table>
            </div>
            
            <!-- Detailed Report -->
            <h1 class="title">{{ this.grouped ? "Class" : "Method" }} Analysis</h1>
            <p class="subtitle">Sorted from maximum time elapsed to minimum.</p>
            <div v-if="grouped">
                <b-collapse
                    class="card"
                    v-for="(data, index) of reportData"
                    :key="index"
                    :open="isOpen == index"
                    @open="isOpen = index">
                    <div
                        slot="trigger"
                        slot-scope="props"
                        class="card-header"
                        role="button">
                        <p class="card-header-title">
                            {{ unpack(data.className) }} ({{ toString(data.totalTime, 1000, 's') }})
                        </p>
                        <a class="card-header-icon">
                            <b-icon
                                :icon="props.open ? 'menu-down' : 'menu-up'">
                            </b-icon>
                        </a>
                    </div>
                    <div class="card-content">
                        <div class="content">
                            <b-table :data="data.tests">
                                <template slot-scope="props">
                                    <b-table-column field="name" label="Test Name">
                                        {{ props.row.name }}
                                    </b-table-column>
                                    <b-table-column field="time" label="Time Elapsed (in seconds)">
                                        {{ toString(props.row.time, 1000) }}
                                    </b-table-column>
                                </template>
                            </b-table>
                        </div>
                    </div>
                </b-collapse>
            </div>
            <div v-else>
                <b-table :data="reportData">
                    <template slot-scope="props">
                        <b-table-column field="class" label="Class Name">
                            {{ unpack(props.row.class.className) }}
                        </b-table-column>
                        <b-table-column field="name" label="Test Name">
                            {{ props.row.name }}
                        </b-table-column>
                        <b-table-column field="time" label="Time Elapsed (in seconds)">
                            {{ toString(props.row.time, 1000) }}
                        </b-table-column>
                    </template>
                </b-table>
            </div>
        </div>
    </div>
</template>
<script>
import parseTestdox from '@/scripts/readtestdox';

export default {
    name: 'testdox-parser-component',
    data() {
        return {
            isOpen: 0,
            summary: null,
            reportData: null,
            file: null,
            grouped: true,
            showPackage: true,
        };
    },
    methods: {
        analyzeTestdoxFile() {
            if (this.file) {
                if (this.grouped) {
                    parseTestdox.parseTestdoxGrouped(this.file, (report) => {
                        this.summary = [report.summary];
                        this.reportData = report.tests;
                    });
                } else {
                    parseTestdox.parseTestdoxSingular(this.file, (report) => {
                        this.summary = [report.summary];
                        this.reportData = report.tests;
                    });
                }
            } else {
                this.$buefy.notification.open({
                    duration: 5000,
                    message: 'No file has been selected yet.',
                    position: 'is-bottom-right',
                    type: 'is-danger',
                    hasIcon: true
                });
            }
        },
        toString(value, factor, denomination) {
            return `${(value / factor).toFixed(2)}${denomination || ''}`;
        },
        unpack(string) {
            let start = string.lastIndexOf('\\');
            return this.showPackage ? string : string.substr(start > 0 ? start + 1 : 0);
        }
    },
    watch: {
        grouped: function() {
            this.reportData = this.summary = null;
            this.$buefy.notification.open({
                duration: 5000,
                message: 'Grouping type changed. Please click analyze again.',
                position: 'is-bottom-right',
                type: 'is-danger',
                hasIcon: true
            });
        }
    }
}
</script>
