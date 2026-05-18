const formatNum = (n) => typeof n === 'number' ? n.toLocaleString() : n;

const vizData = {
    valuation: [
        {metric: "PER", value: "10-15", growth: "20-30+", desc: "가치주는 15미만, 성장주는 30이상"},
        {metric: "PBR", value: "0.5-0.8", growth: "3.0-5.0", desc: "1.0 미만은 저평가(청산가치 하회)"},
        {metric: "ROE", value: "8-10%", growth: "15-20%+", desc: "자본 효율성. 15% 이상 지속 시 우량"},
        {metric: "EV/EBITDA", value: "8-10", growth: "15-20+", desc: "현금 창출력 대비 가치"}
    ],
    companyA: {
        paid: {
            title: "유상증자 (할인발행)",
            before: {shares: 1000, price: 10000, myVal: 1000000},
            after: {shares: 1500, price: 9333, myVal: 933300},
            impact: "bad"
        },
        bonus: {
            title: "무상증자 (자사주 제외)",
            before: {shares: 1000, price: 10000, myVal: 1000000},
            after: {shares: 1900, price: 5263, myVal: 1052600},
            impact: "good"
        }
    },
    history: {
        nikkei: [
            {year: 1985, val: 13000}, {year: 1987, val: 23000},
            {year: 1989, val: 38915}, {year: 1990, val: 24000},
            {year: 1992, val: 14000}
        ],
        usdjpy: [
            {year: 1985, val: 250}, {year: 1986, val: 160},
            {year: 1987, val: 120}, {year: 1988, val: 125},
            {year: 1995, val: 80}
        ]
    }
};

// COMPONENTS
const HomeView = {
    template: '#home-view-tpl',
    emits: ['go-lecture', 'go-ai-lecture', 'go-geo-lecture', 'go-re-lecture', 'go-coding-lecture', 'go-home']
};

const ValuationTable = {
    template: '#valuation-table-tpl',
    data() { return { data: vizData.valuation } }
};

const IndicatorBar = {
    template: '#indicator-bar-tpl',
    props: ['id'],
    data() {
        const bars = {
            'peg': { minLabel: '0.5', maxLabel: '1.5+', gradient: 'linear-gradient(90deg, #30d158 0%, #30d158 33%, #8b95a1 33%, #8b95a1 50%, #e15241 50%, #e15241 100%)', markPos: 33, markLabel: '1.0 (적정)', infoLeft: '<span style="color:var(--color-green)">저평가 (매수)</span>', infoRight: '<span style="color:var(--color-red)">고평가</span>' },
            'per': { minLabel: '10', maxLabel: '30+', gradient: 'linear-gradient(90deg, #30d158 0%, #30d158 30%, #8b95a1 30%, #8b95a1 60%, #e15241 60%, #e15241 100%)', markPos: null, markLabel: '', infoLeft: '<span style="color:var(--color-green)">가치주 (15 미만)</span>', infoRight: '<span style="color:var(--color-red)">성장주 (20 이상)</span>' },
            'pbr': { minLabel: '0.5', maxLabel: '3.0+', gradient: 'linear-gradient(90deg, #30d158 0%, #30d158 40%, #8b95a1 40%, #8b95a1 60%, #e15241 60%, #e15241 100%)', markPos: 40, markLabel: '1.0 (장부가치)', infoLeft: '<span style="color:var(--color-green)">가치주 (1.0 미만)</span>', infoRight: '<span style="color:var(--color-red)">성장주 (3.0 이상)</span>' },
            'roe': { minLabel: '5%', maxLabel: '20%+', gradient: 'linear-gradient(90deg, #e15241 0%, #e15241 30%, #8b95a1 30%, #8b95a1 60%, #30d158 60%, #30d158 100%)', markPos: null, markLabel: '', infoLeft: '<span style="color:var(--color-red)">효율 낮음</span>', infoRight: '<span style="color:var(--color-green)">우량주/성장주 (15%+)</span>' },
            'evebitda': { minLabel: '5', maxLabel: '15+', gradient: 'linear-gradient(90deg, #30d158 0%, #30d158 40%, #8b95a1 40%, #8b95a1 60%, #e15241 60%, #e15241 100%)', markPos: null, markLabel: '', infoLeft: '<span style="color:var(--color-green)">가치주 (10 이하)</span>', infoRight: '<span style="color:var(--color-red)">성장주 (15 이상)</span>' }
        };
        return { bar: bars[this.id] };
    }
};

const ScenarioBox = {
    template: '#scenario-box-tpl',
    props: ['type'],
    methods: { formatNum },
    computed: {
        data() { return vizData.companyA[this.type]; },
        deltaPrice() { return ((this.data.after.price - this.data.before.price) / this.data.before.price * 100).toFixed(1); },
        deltaVal() { return ((this.data.after.myVal - this.data.before.myVal) / this.data.before.myVal * 100).toFixed(1); },
        pColor() { return this.deltaPrice < 0 ? 'col-blue' : 'col-red'; },
        vColor() { return this.deltaVal < 0 ? 'col-blue' : 'col-red'; },
        vSign() { return this.deltaVal > 0 ? '+' : ''; }
    }
};

const SvgChart = {
    template: '#svg-chart-tpl',
    props: ['dataset', 'color'],
    methods: { formatNum },
    computed: {
        vals() { return this.dataset.map(d => d.val); },
        minVal() { return Math.min(...this.vals); },
        maxVal() { return Math.max(...this.vals); },
        points() {
            const pad = 20, width = 300, height = 150;
            return this.dataset.map((d, i) => {
                const x = pad + (i / (this.dataset.length - 1)) * (width - pad * 2);
                const y = height - pad - ((d.val - this.minVal) / (this.maxVal - this.minVal || 1)) * (height - pad * 2);
                return {x, y, val: d.val, year: d.year};
            });
        },
        pointsStr() {
            return this.points.map(p => `${p.x},${p.y}`).join(' ');
        },
        circles() {
            return this.points;
        }
    }
};

const CycleGrid = {
    template: '#cycle-grid-tpl'
};

const LectureView = {
    template: '#lecture-view-tpl',
    emits: ['go-lecture', 'go-home'],
    components: { ValuationTable, IndicatorBar, ScenarioBox, SvgChart, CycleGrid },
    data() {
        return {
            toc: [],
            activeToc: '',
            vizData
        };
    },
    mounted() {
        // Setup TOC logic inside component
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            const id = h.id || `section-${index}`;
            h.id = id;
            tocList.push({
                id: id,
                text: h.textContent.replace(/^Part \d+: /, '').split('(')[0].trim(),
                isSub: h.tagName === 'H3'
            });
        });
        this.toc = tocList;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeToc = entry.target.id;
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        headers.forEach(h => observer.observe(h));
        this.$nextTick(() => this.applyGdpConditionalFormatting());
    },
    methods: {
        applyGdpConditionalFormatting() {
            const table = this.$el.querySelector('#p4-gdp .comp-table');
            if (!table) return;

            const parseNumeric = (text) => {
                const value = Number(text.replace(/,/g, '').replace(/%/g, '').trim());
                return Number.isFinite(value) ? value : null;
            };

            const columns = [
                { index: 4, color: [49, 130, 246] },   // GDP: blue
                { index: 5, color: [22, 163, 74] },    // Market cap: green
                { index: 6, color: [234, 88, 12] }     // Ratio: orange
            ];

            columns.forEach(({ index, color }) => {
                const cells = Array.from(table.querySelectorAll(`tbody tr td:nth-child(${index})`));
                const values = cells.map((cell) => parseNumeric(cell.textContent)).filter((v) => v !== null);
                if (!values.length) return;

                const min = Math.min(...values);
                const max = Math.max(...values);
                const span = max - min || 1;

                cells.forEach((cell) => {
                    const value = parseNumeric(cell.textContent);
                    if (value === null) return;

                    const heat = (value - min) / span;
                    const fill = Math.round(18 + heat * 82);
                    const strong = (0.16 + heat * 0.24).toFixed(3);
                    const weak = (0.04 + heat * 0.08).toFixed(3);

                    cell.classList.add('heat-cell');
                    cell.style.backgroundImage =
                        `linear-gradient(90deg, rgba(${color[0]}, ${color[1]}, ${color[2]}, ${strong}) 0%, rgba(${color[0]}, ${color[1]}, ${color[2]}, ${strong}) ${fill}%, rgba(${color[0]}, ${color[1]}, ${color[2]}, ${weak}) ${fill}%, rgba(${color[0]}, ${color[1]}, ${color[2]}, ${weak}) 100%)`;
                });
            });
        },
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

const AiLectureView = {
    template: '#ai-lecture-view-tpl',
    emits: ['go-home'],
    data() {
        return {
            toc: [],
            activeToc: ''
        };
    },
    mounted() {
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            const id = h.id || `ai-section-${index}`;
            h.id = id;
            tocList.push({
                id: id,
                text: h.textContent.replace(/^Chapter \d+: /, '').split('(')[0].trim(),
                isSub: h.tagName === 'H3'
            });
        });
        this.toc = tocList;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeToc = entry.target.id;
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        headers.forEach(h => observer.observe(h));
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

const GeoLectureView = {
    template: '#geo-lecture-view-tpl',
    emits: ['go-home'],
    data() {
        return {
            toc: [],
            activeToc: ''
        };
    },
    mounted() {
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            const id = h.id || `geo-section-${index}`;
            h.id = id;
            tocList.push({
                id: id,
                text: h.textContent.replace(/^Chapter \d+: /, '').split('(')[0].trim(),
                isSub: h.tagName === 'H3'
            });
        });
        this.toc = tocList;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeToc = entry.target.id;
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        headers.forEach(h => observer.observe(h));
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

const ReLectureView = {
    template: '#re-lecture-view-tpl',
    emits: ['go-home'],
    data() {
        return {
            toc: [],
            activeToc: '',
            selectedGu: null,
            seoulData: [
                // 1급지 (Red)
                { id: 'gangnam', name: '강남구', grade: 1, pyeongPrice: 8500, row: 5, col: 5, dongs: [ {name:'압구정동', price: 12000}, {name:'대치동', price: 9500}, {name:'개포동', price: 9000}, {name:'삼성동', price: 8200}, {name:'역삼동', price: 7800} ] },
                { id: 'seocho', name: '서초구', grade: 1, pyeongPrice: 8200, row: 5, col: 4, dongs: [ {name:'반포동', price: 11000}, {name:'잠원동', price: 9500}, {name:'서초동', price: 7500}, {name:'방배동', price: 6500} ] },
                { id: 'yongsan', name: '용산구', grade: 1, pyeongPrice: 6500, row: 4, col: 4, dongs: [ {name:'한남동', price: 9000}, {name:'이촌동', price: 7500}, {name:'원효로', price: 5500} ] },
                { id: 'songpa', name: '송파구', grade: 1, pyeongPrice: 6200, row: 5, col: 6, dongs: [ {name:'잠실동', price: 7500}, {name:'신천동', price: 7000}, {name:'가락동', price: 5500}, {name:'문정동', price: 5200} ] },

                // 2급지 (Orange)
                { id: 'seongdong', name: '성동구', grade: 2, pyeongPrice: 5500, row: 4, col: 5, dongs: [ {name:'성수동', price: 7500}, {name:'옥수동', price: 6000}, {name:'금호동', price: 5000}, {name:'왕십리', price: 4800} ] },
                { id: 'mapo', name: '마포구', grade: 2, pyeongPrice: 5200, row: 3, col: 3, dongs: [ {name:'아현동', price: 6000}, {name:'용강동', price: 5500}, {name:'공덕동', price: 5000}, {name:'성산동', price: 4500} ] },
                { id: 'gwangjin', name: '광진구', grade: 2, pyeongPrice: 5000, row: 4, col: 6, dongs: [ {name:'광장동', price: 6500}, {name:'구의동', price: 5000}, {name:'자양동', price: 4800} ] },
                { id: 'yangcheon', name: '양천구', grade: 2, pyeongPrice: 4800, row: 4, col: 2, dongs: [ {name:'목동', price: 6500}, {name:'신정동', price: 4500}, {name:'신월동', price: 3000} ] },

                // 3급지 (Yellow)
                { id: 'ydp', name: '영등포구', grade: 3, pyeongPrice: 4500, row: 4, col: 3, dongs: [ {name:'여의도동', price: 7000}, {name:'당산동', price: 4500}, {name:'신길동', price: 4200}, {name:'문래동', price: 4000} ] },
                { id: 'dongjak', name: '동작구', grade: 3, pyeongPrice: 4500, row: 5, col: 3, dongs: [ {name:'흑석동', price: 5800}, {name:'상도동', price: 4500}, {name:'사당동', price: 4200}, {name:'대방동', price: 4000} ] },
                { id: 'jung', name: '중구', grade: 3, pyeongPrice: 4200, row: 3, col: 4, dongs: [ {name:'신당동', price: 4500}, {name:'황학동', price: 3800} ] },
                { id: 'gangdong', name: '강동구', grade: 3, pyeongPrice: 4200, row: 4, col: 7, dongs: [ {name:'고덕동', price: 5500}, {name:'명일동', price: 5000}, {name:'암사동', price: 4200}, {name:'길동', price: 3800} ] },
                { id: 'jongno', name: '종로구', grade: 3, pyeongPrice: 4000, row: 2, col: 4, dongs: [ {name:'평동(경희궁)', price: 6000}, {name:'무악동', price: 4500}, {name:'창신동', price: 3000} ] },

                // 4급지 (Blue)
                { id: 'seodaemun', name: '서대문구', grade: 4, pyeongPrice: 3800, row: 2, col: 3, dongs: [ {name:'북아현동', price: 5000}, {name:'남가좌동', price: 4200}, {name:'홍제동', price: 3500} ] },
                { id: 'dongdaemun', name: '동대문구', grade: 4, pyeongPrice: 3500, row: 3, col: 5, dongs: [ {name:'전농동', price: 4500}, {name:'답십리동', price: 4200}, {name:'청량리동', price: 4000}, {name:'이문동', price: 3500} ] },
                { id: 'seongbuk', name: '성북구', grade: 4, pyeongPrice: 3200, row: 2, col: 5, dongs: [ {name:'길음동', price: 4000}, {name:'종암동', price: 3500}, {name:'정릉동', price: 2800} ] },
                { id: 'gwanak', name: '관악구', grade: 4, pyeongPrice: 3200, row: 6, col: 3, dongs: [ {name:'봉천동', price: 3500}, {name:'신림동', price: 3000} ] },
                { id: 'gangseo', name: '강서구', grade: 4, pyeongPrice: 3200, row: 3, col: 2, dongs: [ {name:'마곡동', price: 5000}, {name:'염창동', price: 4000}, {name:'가양동', price: 3800}, {name:'화곡동', price: 2800} ] },
                { id: 'eunpyeong', name: '은평구', grade: 4, pyeongPrice: 3000, row: 1, col: 4, dongs: [ {name:'녹번동', price: 4000}, {name:'진관동(뉴타운)', price: 3800}, {name:'응암동', price: 3500}, {name:'불광동', price: 3200} ] },

                // 5급지 (Slate)
                { id: 'guro', name: '구로구', grade: 5, pyeongPrice: 2800, row: 5, col: 2, dongs: [ {name:'신도림동', price: 4200}, {name:'구로동', price: 3000}, {name:'개봉동', price: 2500} ] },
                { id: 'nowon', name: '노원구', grade: 5, pyeongPrice: 2800, row: 1, col: 7, dongs: [ {name:'중계동', price: 3800}, {name:'하계동', price: 3200}, {name:'상계동', price: 2600} ] },
                { id: 'jungnang', name: '중랑구', grade: 5, pyeongPrice: 2600, row: 2, col: 6, dongs: [ {name:'상봉동', price: 3200}, {name:'신내동', price: 3000}, {name:'면목동', price: 2500} ] },
                { id: 'geumcheon', name: '금천구', grade: 5, pyeongPrice: 2500, row: 6, col: 2, dongs: [ {name:'독산동', price: 2800}, {name:'시흥동', price: 2500} ] },
                { id: 'gangbuk', name: '강북구', grade: 5, pyeongPrice: 2500, row: 1, col: 5, dongs: [ {name:'미아동', price: 3000}, {name:'번동', price: 2500}, {name:'수유동', price: 2400} ] },
                { id: 'dobong', name: '도봉구', grade: 5, pyeongPrice: 2400, row: 1, col: 6, dongs: [ {name:'창동', price: 3200}, {name:'도봉동', price: 2500}, {name:'방학동', price: 2300} ] }
            ]
        };
    },
    mounted() {
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            if (h.closest('.dong-list-card')) return; // Ignore dynamic inner h3
            const id = h.id || `re-section-${index}`;
            h.id = id;
            let text = h.textContent;
            text = text.replace(/^Chapter \d+[\.\:]?\s*/, '');
            text = text.replace(/^\[.*?\]\s*/, '');
            tocList.push({
                id: id,
                text: text.split('(')[0].trim(),
                isSub: h.tagName === 'H3'
            });
        });
        this.toc = tocList;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeToc = entry.target.id;
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        headers.forEach(h => observer.observe(h));
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        },
        formatPrice(price) {
            return (price/10000).toFixed(1) + '억';
        }
    }
};


const CodingLectureView = {
    template: '#coding-lecture-view-tpl',
    emits: ['go-home'],
    data() {
        return {
            toc: [],
            activeToc: ''
        };
    },
    mounted() {
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            const id = h.id || `coding-section-${index}`;
            h.id = id;
            tocList.push({
                id: id,
                text: h.textContent.replace(/^Chapter \d+: /, '').split('(')[0].trim(),
                isSub: h.tagName === 'H3'
            });
        });
        this.toc = tocList;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeToc = entry.target.id;
                }
            });
        }, { rootMargin: '-10% 0px -70% 0px' });

        headers.forEach(h => observer.observe(h));
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

window.EconAcademy = {
    formatNum,
    vizData,
    ValuationTable,
    IndicatorBar,
    ScenarioBox,
    SvgChart,
    CycleGrid,
    LectureView,
    AiLectureView,
    GeoLectureView,
    ReLectureView,
    CodingLectureView
};

window.mountAcademyView = function mountAcademyView(componentName) {
    const View = window.EconAcademy[componentName];
    if (!View) {
        throw new Error(`Unknown academy view: ${componentName}`);
    }

    Vue.createApp({
        components: { ActiveView: View },
        template: '<active-view @go-home="goHome"></active-view>',
        methods: {
            goHome() {
                window.location.href = '../경제시사공부자료.html';
            }
        }
    }).mount('#app');
};

