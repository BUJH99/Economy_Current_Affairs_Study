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
        
        // Wait for next tick so DOM is fully ready for Leaflet containers
        this.$nextTick(() => {
            this.initAllTacticalMaps();
        });
    },
    beforeUnmount() {
        if (window.EconAcademyMapControls) {
            Object.values(window.EconAcademyMapControls.maps).forEach(map => {
                if (map) map.remove();
            });
            window.EconAcademyMapControls = null;
        }
        if (this.mapTimers) {
            this.mapTimers.forEach(timer => clearTimeout(timer));
        }
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        },
        
        initAllTacticalMaps() {
            this.mapTimers = [];
            
            // Define Global Map Controller Bridge
            window.EconAcademyMapControls = {
                maps: {},
                layers: {},
                defaults: {},
                setLayer(mapId, layerType) {
                    const map = this.maps[mapId];
                    if (!map) return;
                    
                    // Remove all layers first
                    Object.values(this.layers[mapId]).forEach(layer => {
                        map.removeLayer(layer);
                    });
                    
                    // Add selected layer
                    const selectedLayer = this.layers[mapId][layerType];
                    if (selectedLayer) {
                        selectedLayer.addTo(map);
                    }
                    
                    // Update button active states in DOM
                    const buttons = document.querySelectorAll(`.${mapId}-layer-btn`);
                    buttons.forEach(btn => {
                        btn.classList.remove('active');
                        if (layerType === 'satellite' && btn.innerText.includes('위성')) btn.classList.add('active');
                        if (layerType === 'dark' && btn.innerText.includes('전술')) btn.classList.add('active');
                    });
                },
                resetView(mapId) {
                    const map = this.maps[mapId];
                    const def = this.defaults[mapId];
                    if (map && def) {
                        map.setView(def.center, def.zoom);
                    }
                }
            };
            
            // Define global hook functions for HTML onclick attributes
            window.setMapLayer = function(mapId, layerType) {
                if (window.EconAcademyMapControls && window.EconAcademyMapControls.setLayer) {
                    window.EconAcademyMapControls.setLayer(mapId, layerType);
                }
            };
            window.resetMapView = function(mapId) {
                if (window.EconAcademyMapControls && window.EconAcademyMapControls.resetView) {
                    window.EconAcademyMapControls.resetView(mapId);
                }
            };
            
            // Launch mapping initializations
            this.initUkraineMap();
            this.initIsraelMap();
            this.initHormuzMap();
        },
        
        initUkraineMap() {
            const container = document.getElementById('ukraine-leaflet-map');
            if (!container) return;
            
            const center = [48.6, 34.5];
            const zoom = 5.8;
            
            const map = L.map('ukraine-leaflet-map', {
                center: center,
                zoom: zoom,
                zoomControl: false,
                attributionControl: true
            });
            
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            
            const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                maxZoom: 18,
                attribution: 'Map &copy; Google Hybrid'
            });
            const darkTile = L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: 'Map &copy; CARTO'
            });
            const ukraineImageOverlay = L.imageOverlay('../assets/images/ukraine_dark_map_bg.png', [[44.0, 29.5], [51.5, 39.5]], {
                opacity: 0.95,
                interactive: false
            });
            const dark = L.layerGroup([darkTile, ukraineImageOverlay]);
            
            window.EconAcademyMapControls.maps['ukraine'] = map;
            window.EconAcademyMapControls.layers['ukraine'] = { satellite, dark };
            window.EconAcademyMapControls.defaults['ukraine'] = { center, zoom };
            
            satellite.addTo(map);
            
            // Draw Pulsating Frontline (2026 East Frontline)
            const frontlineCoords = [
                [50.25, 36.40],
                [49.60, 37.85],
                [49.00, 38.30],
                [48.60, 37.90],
                [48.27, 37.18],
                [47.80, 37.55],
                [47.51, 35.70],
                [46.72, 33.40],
                [46.50, 32.50]
            ];
            
            L.polyline(frontlineCoords, {
                color: '#ef4444',
                weight: 4.5,
                opacity: 0.85,
                className: 'pulsating-frontline'
            }).addTo(map).bindPopup('<strong>🚨 격전의 동부 전선 (Eastern Frontline)</strong><br>지속적 소모전과 참호전이 심화된 2026년 대치 전선');

            // Clash Points (Stars)
            const clashPoints = [
                { coords: [50.00, 36.23], title: '하르키우 (Kharkiv)', desc: '북부 전선 국경 충돌 및 드론 요격 격전지', popupClass: 'red-popup' },
                { coords: [48.59, 37.83], title: '차시우야르 (Chasiv Yar)', desc: '고지대 방어선 돌파를 둘러싼 혹독한 포병/참호 소모전', popupClass: 'red-popup' },
                { coords: [48.27, 37.18], title: '포크롭스크 (Pokrovsk)', desc: '철도 물류 허브이자 우크라이나 중부 방어선의 중차대한 기점', popupClass: 'red-popup' }
            ];

            clashPoints.forEach(pt => {
                const clashIcon = L.divIcon({
                    html: `<div class="clash-star-marker">💥</div>`,
                    className: '',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                L.marker(pt.coords, { icon: clashIcon }).addTo(map)
                    .bindPopup(`<div class="${pt.popupClass}"><strong>${pt.title}</strong><br>${pt.desc}</div>`);
            });

            // Standard Pins (Kyiv, Zaporizhzhia Plant, Crimea)
            const anchors = [
                { coords: [50.4501, 30.5234], title: '🇺🇦 키이우 (Kyiv)', desc: '수도. 방공 포대 집중 배치 및 국가 지휘본부 가동 중', pulseColor: 'blue-pulse', labelPos: 'label-top' },
                { coords: [47.5112, 34.5855], title: '☢️ 자포리자 원전', desc: '러시아 통제 하에 있으며 국제 핵안보/전력 무기화 긴장 유발', pulseColor: 'yellow-pulse', labelPos: 'label-left' },
                { coords: [44.6166, 33.5254], title: '⚓ 세바스토폴 해군기지', desc: '크림반도 흑해함대 거점. ATACMS 및 자폭 드론 보트 집중 타격 대상', pulseColor: 'red-pulse', labelPos: 'label-bottom' }
            ];
            
            anchors.forEach(anc => {
                const markerIcon = L.divIcon({
                    html: `
                        <div class="tactical-marker ${anc.pulseColor}">
                            <div class="marker-dot"></div>
                            <div class="marker-pulse"></div>
                            <div class="tactical-marker-label ${anc.labelPos}">${anc.title.split(' ')[1] || anc.title}</div>
                        </div>
                    `,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                
                L.marker(anc.coords, { icon: markerIcon }).addTo(map)
                    .bindPopup(`<strong>${anc.title}</strong><br>${anc.desc}`);
            });

            // Missile / Drone Trajectories
            const launch1 = [45.1, 34.2];
            const target1 = [50.4501, 30.5234];
            const points1 = this.getBezierPoints(launch1, target1, 0.28, 40);
            this.animateWeapon(map, points1, '#ef4444', '러시아 샤헤드 자폭 드론', 0);

            const launch2 = [49.8, 31.5];
            const target2 = [44.6166, 33.5254];
            const points2 = this.getBezierPoints(launch2, target2, -0.2, 40);
            this.animateWeapon(map, points2, '#38bdf8', '우크라이나 넵튠/스톰섀도 공습', 1200);
        },
        
        initIsraelMap() {
            const container = document.getElementById('israel-leaflet-map');
            if (!container) return;
            
            const center = [31.7, 35.1];
            const zoom = 7.0;
            
            const map = L.map('israel-leaflet-map', {
                center: center,
                zoom: zoom,
                zoomControl: false,
                attributionControl: true
            });
            
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            
            const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                maxZoom: 18,
                attribution: 'Map &copy; Google Hybrid'
            });
            const darkTile = L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: 'Map &copy; CARTO'
            });
            const israelImageOverlay = L.imageOverlay('../assets/images/israel_dark_map_bg.png', [[29.0, 32.5], [34.5, 37.5]], {
                opacity: 0.95,
                interactive: false
            });
            const dark = L.layerGroup([darkTile, israelImageOverlay]);
            
            window.EconAcademyMapControls.maps['israel'] = map;
            window.EconAcademyMapControls.layers['israel'] = { satellite, dark };
            window.EconAcademyMapControls.defaults['israel'] = { center, zoom };
            
            satellite.addTo(map);
            
            // POIs
            const points = [
                { coords: [32.0853, 34.7818], title: '🇮🇱 텔아비브 (Tel Aviv)', desc: '이스라엘 총참모부 및 에어디펜스 아이언돔 핵심 사령부', pulseColor: 'blue-pulse', labelPos: 'label-left' },
                { coords: [31.4300, 34.4300], title: '🚨 가자지구 (Gaza Strip)', desc: 'Active Combat Zone. 시가전 및 밀도 높은 공습 지속', pulseColor: 'red-pulse', labelPos: 'label-right' },
                { coords: [31.9400, 35.2200], title: '⚠️ 요르단강 서안', desc: '군사 작전 구역. 게릴라 전술 및 경계 강화 돌입', pulseColor: 'red-pulse', labelPos: 'label-bottom' },
                { coords: [33.2700, 35.2000], title: '🇱🇧 레바논 국경 (헤즈볼라)', desc: '레바논 남부 터널망 및 로켓 격발 발사대 대응 포격', pulseColor: 'red-pulse', labelPos: 'label-top' },
                { coords: [33.1200, 35.7900], title: '🇸🇾 골란고원 (시리아 접경)', desc: '시리아 무장 세력 진입 봉쇄 및 미사일 기지 정밀 타격', pulseColor: 'red-pulse', labelPos: 'label-right' }
            ];
            
            points.forEach(pt => {
                const markerIcon = L.divIcon({
                    html: `
                        <div class="tactical-marker ${pt.pulseColor}">
                            <div class="marker-dot"></div>
                            <div class="marker-pulse"></div>
                            <div class="tactical-marker-label ${pt.labelPos}">${pt.title.split(' ')[1] || pt.title}</div>
                        </div>
                    `,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                
                L.marker(pt.coords, { icon: markerIcon }).addTo(map)
                    .bindPopup(`<strong>${pt.title}</strong><br>${pt.desc}`);
            });
            
            // Missile Attack Paths
            const pointsHezb = this.getBezierPoints([33.4, 35.4], [32.0853, 34.7818], 0.35, 30);
            this.animateWeapon(map, pointsHezb, '#f87171', '🇱🇧 레바논 헤즈볼라 카츄샤 로켓', 0);
            
            const pointsHouthi = this.getBezierPoints([29.0, 34.8], [29.55, 34.95], 0.15, 30);
            this.animateWeapon(map, pointsHouthi, '#ef4444', '🇾🇪 예멘 후티 자폭 드론/탄도탄', 900);
            
            const pointsIran = this.getBezierPoints([32.5, 37.8], [32.0853, 34.7818], 0.2, 45);
            this.animateWeapon(map, pointsIran, '#ef4444', '🇮🇷 이란 본토 발사 탄도미사일', 1800);
        },
        
        initHormuzMap() {
            const container = document.getElementById('hormuz-leaflet-map');
            if (!container) return;
            
            const center = [26.48, 56.28];
            const zoom = 8.5;
            
            const map = L.map('hormuz-leaflet-map', {
                center: center,
                zoom: zoom,
                zoomControl: false,
                attributionControl: true
            });
            
            L.control.zoom({ position: 'bottomright' }).addTo(map);
            
            const satellite = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
                maxZoom: 18,
                attribution: 'Map &copy; Google Hybrid'
            });
            const darkTile = L.tileLayer('https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: 'Map &copy; CARTO'
            });
            const hormuzImageOverlay = L.imageOverlay('../assets/images/hormuz_dark_map_bg.png', [[24.8, 54.0], [28.2, 58.5]], {
                opacity: 0.95,
                interactive: false
            });
            const dark = L.layerGroup([darkTile, hormuzImageOverlay]);
            
            window.EconAcademyMapControls.maps['hormuz'] = map;
            window.EconAcademyMapControls.layers['hormuz'] = { satellite, dark };
            window.EconAcademyMapControls.defaults['hormuz'] = { center, zoom };
            
            satellite.addTo(map);
            
            const blockadeLine = [
                [26.88, 56.28],
                [26.35, 56.47]
            ];
            
            L.polyline(blockadeLine, {
                color: '#ef4444',
                weight: 5,
                dashArray: '8, 6',
                opacity: 0.95
            }).addTo(map).bindPopup('<strong>❌ 호르무즈 해협 물리적 봉쇄선</strong><br>전세계 해상 원유 수송량의 20%를 통제하는 최악의 지정학적 목조르기 포인터');
            
            const badgeIcon = L.divIcon({
                html: `<div class="blocked-badge" style="background:#ef4444; color:white; font-size:0.62rem; font-weight:900; padding:3px 6px; border-radius:3px; box-shadow:0 2px 6px rgba(0,0,0,0.4); white-space:nowrap; border:1px solid white;">❌ 호르무즈 해협 봉쇄</div>`,
                className: '',
                iconSize: [80, 20],
                iconAnchor: [40, 10]
            });
            L.marker([26.63, 56.36], { icon: badgeIcon }).addTo(map);

            const tankers = [
                { coords: [26.50, 56.12], title: '🚢 VLCC 유조선 Alpha', desc: '30만톤급 초대형 원유 수송선 (VLCC) 봉쇄 수역 내 강제 정박 및 억류 상태', popupClass: 'yellow-popup' },
                { coords: [26.35, 56.02], title: '🚢 LNG선 Polaris', desc: '천연가스(LNG) 운반선. 통행 허가 거부로 해협 서측에서 대기 정박 중', popupClass: 'yellow-popup' },
                { coords: [26.62, 55.85], title: '🚢 일반 화물선 Orion', desc: '일반 컨테이너선. 이란 혁명수비대 해군 고속정의 위협 검문으로 우회 대기', popupClass: 'yellow-popup' }
            ];

            tankers.forEach(tk => {
                const tankerIcon = L.divIcon({
                    html: `
                        <div class="blocked-ship-marker">
                            <span class="ship-emoji">🚢</span>
                            <span class="blocked-badge">BLOCKED</span>
                        </div>
                    `,
                    className: '',
                    iconSize: [50, 35],
                    iconAnchor: [25, 17]
                });
                
                L.marker(tk.coords, { icon: tankerIcon }).addTo(map)
                    .bindPopup(`<div class="${tk.popupClass}"><strong>${tk.title}</strong><br>${tk.desc}</div>`);
            });

            const units = [
                { coords: [27.18, 56.26], title: '🇮🇷 반다르아바스 미사일 기지', desc: '이란 해군 주력 미사일 사령부. 대함 탄도탄 전술 배치 완료', pulseColor: 'red-pulse', labelPos: 'label-top' },
                { coords: [26.75, 55.85], title: '🇮🇷 케슘섬 미사일포대', desc: '고속 함대와 초음속 지대함 미사일이 밀집 배치된 해협 핵심 요새', pulseColor: 'red-pulse', labelPos: 'label-left' },
                { coords: [25.64, 57.77], title: '🇮🇷 자스크 드론 통제소', desc: '해협 외곽 감시 자폭 드론 부대 및 레이더 감시망 가동 중', pulseColor: 'red-pulse', labelPos: 'label-bottom' },
                { coords: [25.80, 57.05], title: '🇺🇸 미국/연합해군 연대단', desc: '5함대 소속 이지스 구축함 편대. 안전 항로 순찰 및 요격 감시 배치 중', pulseColor: 'blue-pulse', labelPos: 'label-right' }
            ];

            units.forEach(un => {
                const markerIcon = L.divIcon({
                    html: `
                        <div class="tactical-marker ${un.pulseColor}">
                            <div class="marker-dot"></div>
                            <div class="marker-pulse"></div>
                            <div class="tactical-marker-label ${un.labelPos}">${un.title.split(' ')[1] || un.title}</div>
                        </div>
                    `,
                    className: '',
                    iconSize: [14, 14],
                    iconAnchor: [7, 7]
                });
                
                L.marker(un.coords, { icon: markerIcon }).addTo(map)
                    .bindPopup(`<strong>${un.title}</strong><br>${un.desc}`);
            });

            const pointsTarget1 = this.getBezierPoints([27.18, 56.26], [26.50, 56.12], 0.2, 20);
            const pointsTarget2 = this.getBezierPoints([26.75, 55.85], [26.62, 55.85], -0.3, 20);
            
            L.polyline(pointsTarget1, { color: '#ef4444', weight: 1.5, opacity: 0.45, dashArray: '3, 3' }).addTo(map);
            L.polyline(pointsTarget2, { color: '#ef4444', weight: 1.5, opacity: 0.45, dashArray: '3, 3' }).addTo(map);
        },
        
        getBezierPoints(p1, p2, heightFactor = 0.25, numPoints = 40) {
            const points = [];
            const [lat1, lng1] = p1;
            const [lat2, lng2] = p2;
            const midLat = (lat1 + lat2) / 2;
            const midLng = (lng1 + lng2) / 2;
            const dist = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
            
            const ctrlLat = midLat + dist * heightFactor + (lat1 < lat2 ? 0.3 : -0.3);
            const ctrlLng = midLng + (lat2 - lat1) * heightFactor * 0.15;
            
            for (let i = 0; i <= numPoints; i++) {
                const t = i / numPoints;
                const lat = (1-t)*(1-t)*lat1 + 2*(1-t)*t*ctrlLat + t*t*lat2;
                const lng = (1-t)*(1-t)*lng1 + 2*(1-t)*t*ctrlLng + t*t*lng2;
                points.push([lat, lng]);
            }
            return points;
        },
        
        animateWeapon(map, points, color, label, delay = 0) {
            const trail = L.polyline(points, {
                color: color,
                weight: 2,
                opacity: 0.4,
                className: 'missile-trajectory'
            }).addTo(map);

            const dot = L.circleMarker(points[0], {
                radius: 5.5,
                color: '#ffffff',
                fillColor: color,
                fillOpacity: 1,
                weight: 1.5,
                className: 'glowing-missile'
            }).addTo(map);

            dot.bindPopup(`<strong>${label}</strong><br>궤적 추적 및 비행 타격 시뮬레이션 중`);

            let index = 0;
            const run = () => {
                if (!window.EconAcademyMapControls) return;
                
                if (index >= points.length) {
                    index = 0;
                }
                dot.setLatLng(points[index]);
                index++;
                
                const timer = setTimeout(run, 45);
                this.mapTimers.push(timer);
            };
            
            const startTimer = setTimeout(run, delay);
            this.mapTimers.push(startTimer);
        }
    }
};

const seoulPriceGeoJsonUrl = 'https://raw.githubusercontent.com/southkorea/seoul-maps/master/kostat/2013/json/seoul_municipalities_geo_simple.json';

const seoulPriceStops = [
    { label: '< 15,000,000', max: 1500, color: '#a8d7ff' },
    { label: '15,000,000 - 20,000,000', min: 1500, max: 2000, color: '#82b7f6' },
    { label: '20,000,000 - 25,000,000', min: 2000, max: 2500, color: '#7f8ded' },
    { label: '25,000,000 - 30,000,000', min: 2500, max: 3000, color: '#8e64e8' },
    { label: '30,000,000 - 35,000,000', min: 3000, max: 3500, color: '#aa4bdd' },
    { label: '35,000,000 - 40,000,000', min: 3500, max: 4000, color: '#c23ec7' },
    { label: '40,000,000 - 45,000,000', min: 4000, max: 4500, color: '#d936a3' },
    { label: '>= 45,000,000', min: 4500, color: '#cf1e76' }
];

const seoulBaseMapStyle = {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
        'carto-light': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; CARTO &copy; OpenStreetMap contributors'
        },
        'carto-labels': {
            type: 'raster',
            tiles: ['https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; CARTO &copy; OpenStreetMap contributors'
        },
        'esri-satellite': {
            type: 'raster',
            tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: 'Tiles &copy; Esri'
        }
    },
    layers: [
        {
            id: 'carto-base',
            type: 'raster',
            source: 'carto-light',
            paint: {
                'raster-opacity': 0.86,
                'raster-saturation': -0.2
            }
        },
        {
            id: 'satellite-base',
            type: 'raster',
            source: 'esri-satellite',
            layout: { visibility: 'none' },
            paint: {
                'raster-opacity': 0.48,
                'raster-saturation': -0.25
            }
        },
        {
            id: 'carto-road-labels',
            type: 'raster',
            source: 'carto-labels',
            layout: { visibility: 'none' },
            paint: { 'raster-opacity': 0.82 }
        }
    ]
};

const getSeoulPriceColor = (price) => {
    const stop = seoulPriceStops.find((item) => {
        const aboveMin = item.min === undefined || price >= item.min;
        const belowMax = item.max === undefined || price < item.max;
        return aboveMin && belowMax;
    });

    return stop ? stop.color : seoulPriceStops[seoulPriceStops.length - 1].color;
};

const buildSeoulPriceData = () => {
    const data = [
        { id: 'gangnam', name: '강남구', grade: 1, pyeongPrice: 4850, dongs: [{ name: '압구정동', price: 6200 }, { name: '대치동', price: 5350 }, { name: '개포동', price: 4880 }, { name: '삼성동', price: 4750 }, { name: '역삼동', price: 4300 }] },
        { id: 'seocho', name: '서초구', grade: 1, pyeongPrice: 4550, dongs: [{ name: '반포동', price: 5900 }, { name: '잠원동', price: 5150 }, { name: '서초동', price: 4300 }, { name: '방배동', price: 3950 }] },
        { id: 'songpa', name: '송파구', grade: 1, pyeongPrice: 4200, dongs: [{ name: '잠실동', price: 5100 }, { name: '신천동', price: 4800 }, { name: '문정동', price: 3850 }, { name: '가락동', price: 3650 }] },
        { id: 'yongsan', name: '용산구', grade: 1, pyeongPrice: 4050, dongs: [{ name: '한남동', price: 5600 }, { name: '이촌동', price: 4550 }, { name: '원효로', price: 3500 }] },
        { id: 'seongdong', name: '성동구', grade: 2, pyeongPrice: 3800, dongs: [{ name: '성수동', price: 4700 }, { name: '옥수동', price: 4050 }, { name: '금호동', price: 3500 }, { name: '왕십리', price: 3350 }] },
        { id: 'mapo', name: '마포구', grade: 2, pyeongPrice: 3600, dongs: [{ name: '아현동', price: 4050 }, { name: '공덕동', price: 3750 }, { name: '용강동', price: 3600 }, { name: '성산동', price: 3050 }] },
        { id: 'gwangjin', name: '광진구', grade: 2, pyeongPrice: 3450, dongs: [{ name: '광장동', price: 4300 }, { name: '자양동', price: 3450 }, { name: '구의동', price: 3250 }] },
        { id: 'yangcheon', name: '양천구', grade: 2, pyeongPrice: 3350, dongs: [{ name: '목동', price: 4400 }, { name: '신정동', price: 3150 }, { name: '신월동', price: 2350 }] },
        { id: 'ydp', name: '영등포구', grade: 3, pyeongPrice: 3200, dongs: [{ name: '여의도동', price: 4650 }, { name: '당산동', price: 3350 }, { name: '문래동', price: 3100 }, { name: '신길동', price: 2950 }] },
        { id: 'dongjak', name: '동작구', grade: 3, pyeongPrice: 3150, dongs: [{ name: '흑석동', price: 4050 }, { name: '상도동', price: 3150 }, { name: '사당동', price: 3000 }, { name: '대방동', price: 2850 }] },
        { id: 'jung', name: '중구', grade: 3, pyeongPrice: 3050, dongs: [{ name: '신당동', price: 3300 }, { name: '황학동', price: 2850 }] },
        { id: 'jongno', name: '종로구', grade: 3, pyeongPrice: 2950, dongs: [{ name: '평동', price: 3950 }, { name: '무악동', price: 3200 }, { name: '창신동', price: 2300 }] },
        { id: 'gangdong', name: '강동구', grade: 3, pyeongPrice: 2850, dongs: [{ name: '고덕동', price: 3600 }, { name: '명일동', price: 3300 }, { name: '암사동', price: 2850 }, { name: '길동', price: 2650 }] },
        { id: 'seodaemun', name: '서대문구', grade: 4, pyeongPrice: 2700, dongs: [{ name: '북아현동', price: 3450 }, { name: '남가좌동', price: 2950 }, { name: '홍제동', price: 2500 }] },
        { id: 'dongdaemun', name: '동대문구', grade: 4, pyeongPrice: 2550, dongs: [{ name: '전농동', price: 3200 }, { name: '답십리동', price: 3000 }, { name: '청량리동', price: 2850 }, { name: '이문동', price: 2450 }] },
        { id: 'seongbuk', name: '성북구', grade: 4, pyeongPrice: 2450, dongs: [{ name: '길음동', price: 3050 }, { name: '종암동', price: 2650 }, { name: '정릉동', price: 2150 }] },
        { id: 'gangseo', name: '강서구', grade: 4, pyeongPrice: 2400, dongs: [{ name: '마곡동', price: 3400 }, { name: '염창동', price: 2850 }, { name: '가양동', price: 2650 }, { name: '화곡동', price: 2050 }] },
        { id: 'gwanak', name: '관악구', grade: 4, pyeongPrice: 2350, dongs: [{ name: '봉천동', price: 2600 }, { name: '신림동', price: 2150 }] },
        { id: 'eunpyeong', name: '은평구', grade: 4, pyeongPrice: 2250, dongs: [{ name: '녹번동', price: 2850 }, { name: '진관동', price: 2700 }, { name: '응암동', price: 2450 }, { name: '불광동', price: 2300 }] },
        { id: 'guro', name: '구로구', grade: 5, pyeongPrice: 2100, dongs: [{ name: '신도림동', price: 3150 }, { name: '구로동', price: 2200 }, { name: '개봉동', price: 1850 }] },
        { id: 'nowon', name: '노원구', grade: 5, pyeongPrice: 2050, dongs: [{ name: '중계동', price: 2800 }, { name: '하계동', price: 2300 }, { name: '상계동', price: 1900 }] },
        { id: 'jungnang', name: '중랑구', grade: 5, pyeongPrice: 1950, dongs: [{ name: '상봉동', price: 2400 }, { name: '신내동', price: 2150 }, { name: '면목동', price: 1800 }] },
        { id: 'geumcheon', name: '금천구', grade: 5, pyeongPrice: 1900, dongs: [{ name: '독산동', price: 2100 }, { name: '시흥동', price: 1800 }] },
        { id: 'gangbuk', name: '강북구', grade: 5, pyeongPrice: 1850, dongs: [{ name: '미아동', price: 2250 }, { name: '번동', price: 1850 }, { name: '수유동', price: 1750 }] },
        { id: 'dobong', name: '도봉구', grade: 5, pyeongPrice: 1750, dongs: [{ name: '창동', price: 2350 }, { name: '도봉동', price: 1800 }, { name: '방학동', price: 1700 }] }
    ].map((gu) => ({ ...gu, color: getSeoulPriceColor(gu.pyeongPrice) }));

    const ranked = [...data].sort((a, b) => b.pyeongPrice - a.pyeongPrice);
    data.forEach((gu) => {
        gu.rank = ranked.findIndex((item) => item.id === gu.id) + 1;
    });

    return data;
};

const ReLectureView = {
    template: '#re-lecture-view-tpl',
    emits: ['go-home'],
    data() {
        const seoulData = buildSeoulPriceData();

        return {
            toc: [],
            activeToc: '',
            selectedGu: seoulData[0],
            seoulData,
            priceStops: seoulPriceStops,
            miniPaths: [],
            mapLoading: true,
            mapError: '',
            layerPanelCollapsed: false,
            priceLegendCollapsed: false,
            extrusionEnabled: true,
            heightScale: 0.35,
            layers: {
                price: true,
                boundary: true,
                roads: false,
                satellite: false
            }
        };
    },
    mounted() {
        const headers = this.$el.querySelectorAll('h2, h3');
        const tocList = [];
        headers.forEach((h, index) => {
            if (h.closest('.seoul-maplibre-shell') || h.closest('.district-insight-card')) return;
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
        this.$nextTick(() => this.initSeoulMap());
    },
    beforeUnmount() {
        if (this.mapPopup) this.mapPopup.remove();
        if (this.seoulMapInstance) this.seoulMapInstance.remove();
    },
    methods: {
        scrollTo(id) {
            const el = document.getElementById(id);
            if(el) el.scrollIntoView({ behavior: 'smooth' });
        },
        formatPrice(price) {
            return (price/10000).toFixed(1) + '억';
        },
        formatKrw(price) {
            return `₩${(price * 10000).toLocaleString('ko-KR')}`;
        },
        initSeoulMap() {
            if (!this.$refs.seoulMap) return;

            if (!window.maplibregl) {
                this.mapLoading = false;
                this.mapError = 'MapLibre GL JS를 불러오지 못했습니다.';
                return;
            }

            const map = new maplibregl.Map({
                container: this.$refs.seoulMap,
                style: seoulBaseMapStyle,
                center: [126.993, 37.556],
                zoom: 10.05,
                pitch: 50,
                bearing: -18,
                antialias: true,
                attributionControl: false,
                localIdeographFontFamily: '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
            });

            this.seoulMapInstance = map;
            map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }), 'top-left');
            map.addControl(new maplibregl.FullscreenControl(), 'top-left');
            map.addControl(new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true } }), 'top-left');
            map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

            map.on('load', () => this.loadSeoulDistricts());
        },
        async loadSeoulDistricts() {
            try {
                const response = await fetch(seoulPriceGeoJsonUrl);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const geoJson = await response.json();
                const enrichedGeoJson = this.enrichSeoulGeoJson(geoJson);
                this.buildMiniMapPaths(enrichedGeoJson.features);
                this.addSeoulMapLayers(enrichedGeoJson);
                this.mapLoading = false;
                this.syncMapLayers();
                this.syncSelectedDistrict(this.selectedGu.id);

                const initialFeature = enrichedGeoJson.features.find((feature) => feature.properties.id === this.selectedGu.id);
                if (initialFeature) {
                    this.showDistrictPopup(this.selectedGu, this.getGeometryCenter(initialFeature.geometry));
                }
            } catch (error) {
                this.mapLoading = false;
                this.mapError = '서울시 행정구역 GeoJSON을 불러오지 못했습니다.';
                console.error(error);
            }
        },
        enrichSeoulGeoJson(geoJson) {
            const priceByName = new Map(this.seoulData.map((gu) => [gu.name, gu]));
            const prices = this.seoulData.map((gu) => gu.pyeongPrice);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const range = maxPrice - minPrice || 1;

            return {
                type: 'FeatureCollection',
                features: geoJson.features
                    .map((feature) => {
                        const gu = priceByName.get(feature.properties.name);
                        if (!gu) return null;

                        const normalized = (gu.pyeongPrice - minPrice) / range;
                        return {
                            ...feature,
                            id: gu.id,
                            properties: {
                                ...feature.properties,
                                id: gu.id,
                                name: gu.name,
                                grade: gu.grade,
                                rank: gu.rank,
                                pyeongPrice: gu.pyeongPrice,
                                priceKrw: gu.pyeongPrice * 10000,
                                color: gu.color,
                                height: 1800 + normalized * 9000
                            }
                        };
                    })
                    .filter(Boolean)
            };
        },
        addSeoulMapLayers(geoJson) {
            const map = this.seoulMapInstance;
            if (!map) return;

            if (map.getSource('seoul-districts')) {
                map.getSource('seoul-districts').setData(geoJson);
                return;
            }

            map.addSource('seoul-districts', {
                type: 'geojson',
                data: geoJson,
                promoteId: 'id'
            });

            map.addLayer({
                id: 'seoul-price-flat',
                type: 'fill',
                source: 'seoul-districts',
                layout: { visibility: 'none' },
                paint: {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        0.92,
                        0.78
                    ]
                }
            });

            map.addLayer({
                id: 'seoul-price-extrusion',
                type: 'fill-extrusion',
                source: 'seoul-districts',
                paint: {
                    'fill-extrusion-color': ['get', 'color'],
                    'fill-extrusion-height': this.getExtrusionHeightExpression(),
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.86,
                    'fill-extrusion-vertical-gradient': true
                }
            });

            map.addLayer({
                id: 'seoul-boundary',
                type: 'line',
                source: 'seoul-districts',
                paint: {
                    'line-color': '#ffffff',
                    'line-width': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        2.7,
                        1.35
                    ],
                    'line-opacity': 0.92
                }
            });

            map.addLayer({
                id: 'seoul-selected-outline',
                type: 'line',
                source: 'seoul-districts',
                filter: ['==', ['get', 'id'], this.selectedGu.id],
                paint: {
                    'line-color': '#312e81',
                    'line-width': 3.5,
                    'line-opacity': 0.95
                }
            });

            map.addLayer({
                id: 'seoul-price-label',
                type: 'symbol',
                source: 'seoul-districts',
                layout: {
                    'text-field': ['get', 'name'],
                    'text-font': ['Open Sans Bold'],
                    'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 11, 15],
                    'text-allow-overlap': false,
                    'text-ignore-placement': false
                },
                paint: {
                    'text-color': '#ffffff',
                    'text-halo-color': 'rgba(42, 55, 105, 0.82)',
                    'text-halo-width': 1.8,
                    'text-halo-blur': 0.5
                }
            });

            ['seoul-price-extrusion', 'seoul-price-flat'].forEach((layerId) => {
                map.on('mousemove', layerId, (event) => this.handleDistrictHover(event));
                map.on('mouseleave', layerId, () => this.clearDistrictHover());
                map.on('click', layerId, (event) => {
                    const feature = event.features && event.features[0];
                    if (feature) this.selectDistrict(feature, event.lngLat);
                });
            });

            map.fitBounds([[126.74, 37.41], [127.19, 37.72]], {
                padding: { top: 70, right: 320, bottom: 80, left: 70 },
                duration: 0,
                pitch: 50,
                bearing: -18
            });
        },
        getExtrusionHeightExpression() {
            return [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                ['*', ['get', 'height'], this.heightScale * 1.12],
                ['*', ['get', 'height'], this.heightScale]
            ];
        },
        handleDistrictHover(event) {
            const map = this.seoulMapInstance;
            const feature = event.features && event.features[0];
            if (!map || !feature) return;

            map.getCanvas().style.cursor = 'pointer';
            const nextId = feature.properties.id;
            if (this.hoveredDistrictId === nextId) return;

            this.clearDistrictHover();
            this.hoveredDistrictId = nextId;
            map.setFeatureState({ source: 'seoul-districts', id: nextId }, { hover: true });
        },
        clearDistrictHover() {
            const map = this.seoulMapInstance;
            if (!map) return;

            map.getCanvas().style.cursor = '';
            if (this.hoveredDistrictId) {
                map.setFeatureState({ source: 'seoul-districts', id: this.hoveredDistrictId }, { hover: false });
                this.hoveredDistrictId = null;
            }
        },
        selectDistrict(feature, lngLat) {
            const selected = this.seoulData.find((gu) => gu.id === feature.properties.id);
            if (!selected) return;

            this.selectedGu = selected;
            this.syncSelectedDistrict(selected.id);
            this.showDistrictPopup(selected, lngLat);
        },
        showDistrictPopup(gu, lngLat) {
            const map = this.seoulMapInstance;
            if (!map || !lngLat) return;

            const html = `
                <div class="seoul-popup-card">
                    <button type="button" class="popup-close-spacer" aria-hidden="true"></button>
                    <strong>${gu.name}</strong>
                    <span>Price per pyeong</span>
                    <b>${this.formatKrw(gu.pyeongPrice)}</b>
                    <span>Rank</span>
                    <b>${gu.rank} / 25</b>
                </div>
            `;

            if (this.mapPopup) this.mapPopup.remove();
            this.mapPopup = new maplibregl.Popup({
                closeButton: true,
                closeOnClick: false,
                offset: [0, -20],
                className: 'seoul-price-popup'
            })
                .setLngLat(lngLat)
                .setHTML(html)
                .addTo(map);
        },
        syncSelectedDistrict(id) {
            const map = this.seoulMapInstance;
            if (!map || !map.getLayer('seoul-selected-outline')) return;

            map.setFilter('seoul-selected-outline', ['==', ['get', 'id'], id]);
        },
        syncMapLayers() {
            const map = this.seoulMapInstance;
            if (!map || !map.isStyleLoaded()) return;

            const setVisibility = (layerId, visible) => {
                if (map.getLayer(layerId)) {
                    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
                }
            };

            setVisibility('seoul-price-extrusion', this.layers.price && this.extrusionEnabled);
            setVisibility('seoul-price-flat', this.layers.price && !this.extrusionEnabled);
            setVisibility('seoul-price-label', this.layers.price);
            setVisibility('seoul-boundary', this.layers.boundary);
            setVisibility('seoul-selected-outline', this.layers.boundary);
            setVisibility('carto-road-labels', this.layers.roads);
            setVisibility('satellite-base', this.layers.satellite);

            if (map.getLayer('carto-base')) {
                map.setPaintProperty('carto-base', 'raster-opacity', this.layers.satellite ? 0.28 : 0.86);
            }
        },
        toggleExtrusion() {
            this.extrusionEnabled = !this.extrusionEnabled;
            this.syncMapLayers();
        },
        syncExtrusionHeight() {
            const map = this.seoulMapInstance;
            if (!map || !map.getLayer('seoul-price-extrusion')) return;

            map.setPaintProperty('seoul-price-extrusion', 'fill-extrusion-height', this.getExtrusionHeightExpression());
        },
        collectCoordinates(coordinates, points = []) {
            if (!Array.isArray(coordinates)) return points;
            if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
                points.push(coordinates);
                return points;
            }

            coordinates.forEach((item) => this.collectCoordinates(item, points));
            return points;
        },
        getGeometryCenter(geometry) {
            const points = this.collectCoordinates(geometry.coordinates, []);
            if (!points.length) return null;

            const lngs = points.map((point) => point[0]);
            const lats = points.map((point) => point[1]);
            return [
                (Math.min(...lngs) + Math.max(...lngs)) / 2,
                (Math.min(...lats) + Math.max(...lats)) / 2
            ];
        },
        buildMiniMapPaths(features) {
            const allPoints = [];
            features.forEach((feature) => this.collectCoordinates(feature.geometry.coordinates, allPoints));
            if (!allPoints.length) return;

            const lngs = allPoints.map((point) => point[0]);
            const lats = allPoints.map((point) => point[1]);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const spanLng = maxLng - minLng || 1;
            const spanLat = maxLat - minLat || 1;

            const project = (point) => {
                const x = 12 + ((point[0] - minLng) / spanLng) * 136;
                const y = 106 - ((point[1] - minLat) / spanLat) * 92;
                return [x.toFixed(2), y.toFixed(2)];
            };

            const ringToPath = (ring) => ring
                .map((point, index) => {
                    const [x, y] = project(point);
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ') + ' Z';

            const polygonToPath = (polygon) => polygon.map(ringToPath).join(' ');

            this.miniPaths = features.map((feature) => {
                const d = feature.geometry.type === 'MultiPolygon'
                    ? feature.geometry.coordinates.map(polygonToPath).join(' ')
                    : polygonToPath(feature.geometry.coordinates);

                return {
                    id: feature.properties.id,
                    d
                };
            });
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
                window.location.href = '../index.html';
            }
        }
    }).mount('#app');
};
