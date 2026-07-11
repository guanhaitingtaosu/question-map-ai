/**
 * 问题地图 AI - Problem Map AI
 * MVP Frontend Logic
 */

(function () {
    'use strict';

    // ===== DOM Elements =====
    const pages = {
        home: document.getElementById('pageHome'),
        input: document.getElementById('pageInput'),
        diag: document.getElementById('pageDiag'),
        result: document.getElementById('pageResult'),
    };

    const els = {
        btnStart: document.getElementById('btnStart'),
        btnBackToHome: document.getElementById('btnBackToHome'),
        btnBackToInput: document.getElementById('btnBackToInput'),
        btnNextDiag: document.getElementById('btnNextDiag'),
        btnRestart: document.getElementById('btnRestart'),
        btnUpgrade: document.getElementById('btnUpgrade'),
        userProblem: document.getElementById('userProblem'),
        charNum: document.getElementById('charNum'),
        resultContainer: document.getElementById('resultContainer'),
        modalOverlay: document.getElementById('modalOverlay'),
        modalClose: document.getElementById('modalClose'),
        diagSteps: [
            document.getElementById('diagStep1'),
            document.getElementById('diagStep2'),
            document.getElementById('diagStep3'),
        ],
    };

    // ===== State =====
    const state = {
        problem: '',
        answers: { q1: '', q2: '', q3: '' },
        currentDiagStep: 0,
        result: null,
    };

    // ===== Problem Analysis Engine =====
    const analysisEngine = {
        types: {
            ability: {
                name: '能力型问题',
                icon: '🧩',
                description: '你的问题更像<strong>能力缺口</strong>。你缺少的不是努力，而是某个具体的、可习得的能力。好消息是：能力可以被拆解、学习和训练。',
                flow: ['发现问题', '想要解决', '发现缺少关键技能', '感到无力', '需要拆解能力项'],
                highlightIndex: 2,
                breakthrough: '不要把「不会」当成「不行」。<strong>拆解你需要的那个具体能力</strong>，找到可以学的路径，给它时间和练习。能力缺口是唯一可以被"学"掉的问题。',
            },
            execution: {
                name: '执行型问题',
                icon: '⚡',
                description: '你不是不知道答案，而是<strong>行动系统没有建立</strong>。认知和行动之间有一道鸿沟，你需要的不是更多信息，而是一个能跑起来的执行机制。',
                flow: ['知道方法', '告诉自己开始', '拖延 / 完美主义', '焦虑堆积', '放弃或敷衍', '责怪自己'],
                highlightIndex: 2,
                breakthrough: '停止囤积方法论。<strong>把行动拆到「今天就能做的最小一步」</strong>，建立触发机制而不是依赖意志力。执行的秘密不是自律，是降低启动成本。',
            },
            cycle: {
                name: '循环型问题',
                icon: '🔄',
                description: '你的问题正在<strong>形成循环</strong>。你不是没有努力，而是在重复同一种解决方式，而这种方式本身就是问题的一部分。你需要跳出循环，而不是在循环里更努力。',
                flow: ['发现问题', '寻找方法', '短暂行动', '遇到阻力', '怀疑自己', '重新寻找方法'],
                highlightIndex: 4,
                breakthrough: '不要继续寻找更多答案。<strong>先重新理解：你到底在解决什么问题。</strong>循环的出口往往不在循环的方向上，而是需要你换一层视角来看待这件事。',
            },
            identity: {
                name: '身份型问题',
                icon: '🧭',
                description: '你的核心问题可能不是目标，而是<strong>身份和方向</strong>。当你不确定自己「是谁」和「要成为什么」，所有具体问题都会变成无解的——因为没有锚点，就没有优先级。',
                flow: ['模糊的不安', '尝试各种方向', '无法深入投入', '感到空虚', '怀疑自己的选择', '回到模糊的不安'],
                highlightIndex: 1,
                breakthrough: '暂停寻找答案。<strong>先花时间去感受：什么事情让你忘了时间？什么状态下你觉得「这就是我想成为的人」？</strong>身份不是想出来的，是在行动中被发现的。',
            },
        },

        analyze(answers) {
            const { q1, q2, q3 } = answers;

            // Scoring system
            const scores = {
                ability: 0,
                execution: 0,
                cycle: 0,
                identity: 0,
            };

            // Q1: Core pain point
            if (q1 === 'A') scores.ability += 3;
            if (q1 === 'B') scores.execution += 3;
            if (q1 === 'C') scores.cycle += 3;
            if (q1 === 'D') scores.identity += 3;

            // Q2: Duration
            if (q2 === 'A') scores.ability += 1; // Recent → likely skill gap
            if (q2 === 'B') scores.cycle += 2;   // Long-term → cycle
            if (q2 === 'C') {
                scores.cycle += 3;
                scores.identity += 2;
            }

            // Q3: Reaction
            if (q3 === 'A') scores.ability += 2;  // Seeking more methods
            if (q3 === 'B') {
                scores.execution += 2;
                scores.identity += 1;
            }
            if (q3 === 'C') {
                scores.execution += 2;
                scores.cycle += 1;
            }
            if (q3 === 'D') scores.identity += 2;

            // Find highest scoring type
            let maxType = 'ability';
            let maxScore = 0;
            for (const [type, score] of Object.entries(scores)) {
                if (score > maxScore) {
                    maxScore = score;
                    maxType = type;
                }
            }

            return this.types[maxType];
        },
    };

    // ===== Page Navigation =====
    function showPage(pageName) {
        Object.values(pages).forEach((p) => p.classList.remove('active'));
        pages[pageName].classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Diagnosis Flow =====
    function showDiagStep(stepIndex) {
        els.diagSteps.forEach((step, i) => {
            step.classList.toggle('active', i === stepIndex);
        });
        state.currentDiagStep = stepIndex;
    }

    function handleDiagAnswer(questionKey, value) {
        state.answers[questionKey] = value;

        // Auto-advance after a short delay
        setTimeout(() => {
            if (questionKey === 'q1') {
                showDiagStep(1);
            } else if (questionKey === 'q2') {
                showDiagStep(2);
            } else if (questionKey === 'q3') {
                // All answered → generate result
                generateResult();
            }
        }, 350);
    }

    // ===== Result Generation =====
    function generateResult() {
        // Show loading
        showLoading(true);

        setTimeout(() => {
            const analysis = analysisEngine.analyze(state.answers);
            state.result = analysis;

            renderResult(analysis);
            showLoading(false);
            showPage('result');

            // Save data
            saveToDatabase();
        }, 1200);
    }

    function renderResult(analysis) {
        const flowHTML = analysis.flow
            .map(
                (node, i) => `
                <div class="flow-node ${i === analysis.highlightIndex ? 'highlight' : ''}">${node}</div>
                ${i < analysis.flow.length - 1 ? '<div class="flow-arrow"></div>' : ''}
            `
            )
            .join('');

        els.resultContainer.innerHTML = `
            <div class="result-header">
                <h2>你的问题地图</h2>
                <p>基于你的回答，系统识别出以下结构</p>
            </div>

            <div class="result-card">
                <div class="result-card-header">
                    <h3>你的问题</h3>
                </div>
                <div class="result-card-body">
                    <div class="problem-statement">${escapeHtml(state.problem)}</div>
                </div>
            </div>

            <div class="result-card">
                <div class="result-card-header">
                    <h3>问题类型</h3>
                </div>
                <div class="result-card-body">
                    <div class="type-badge">
                        <span class="type-icon">${analysis.icon}</span>
                        <span>${analysis.name}</span>
                    </div>
                    <p class="result-description" style="margin-top: 16px;">${analysis.description}</p>
                </div>
            </div>

            <div class="result-card">
                <div class="result-card-header">
                    <h3>隐藏模式</h3>
                </div>
                <div class="flow-diagram">
                    ${flowHTML}
                </div>
            </div>

            <div class="result-card">
                <div class="result-card-header">
                    <h3>突破方向</h3>
                </div>
                <div class="breakthrough-box">
                    <p>${analysis.breakthrough}</p>
                </div>
            </div>
        `;
    }

    // ===== Data Persistence =====
    function saveToDatabase() {
        const record = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            timestamp: new Date().toISOString(),
            problem: state.problem,
            answers: { ...state.answers },
            resultType: Object.entries(analysisEngine.types).find(
                ([, v]) => v === state.result
            )?.[0],
            resultName: state.result.name,
        };

        try {
            const existing = JSON.parse(localStorage.getItem('problemMapData') || '[]');
            existing.push(record);
            localStorage.setItem('problemMapData', JSON.stringify(existing));
        } catch (e) {
            // Silent fail for localStorage
            console.warn('Could not save data:', e);
        }
    }

    // ===== Utilities =====
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showLoading(show) {
        let overlay = document.querySelector('.loading-overlay');
        if (show && !overlay) {
            overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner"></div>
                <div class="loading-text">正在分析你的问题结构…</div>
            `;
            document.body.appendChild(overlay);
        }
        if (overlay) {
            overlay.classList.toggle('active', show);
        }
    }

    function resetState() {
        state.problem = '';
        state.answers = { q1: '', q2: '', q3: '' };
        state.currentDiagStep = 0;
        state.result = null;

        els.userProblem.value = '';
        els.charNum.textContent = '0';
        els.btnNextDiag.disabled = true;

        // Reset radio buttons
        document.querySelectorAll('input[type="radio"]').forEach((r) => (r.checked = false));

        showDiagStep(0);
    }

    // ===== Event Bindings =====
    function bindEvents() {
        // Home → Input
        els.btnStart.addEventListener('click', () => {
            showPage('input');
            setTimeout(() => els.userProblem.focus(), 400);
        });

        // Input → Home
        els.btnBackToHome.addEventListener('click', () => showPage('home'));

        // Input text handling
        els.userProblem.addEventListener('input', (e) => {
            const len = e.target.value.trim().length;
            els.charNum.textContent = len;
            els.btnNextDiag.disabled = len === 0;
        });

        // Input → Diagnosis
        els.btnNextDiag.addEventListener('click', () => {
            state.problem = els.userProblem.value.trim();
            if (!state.problem) return;
            showPage('diag');
            showDiagStep(0);
        });

        // Diagnosis → Input
        els.btnBackToInput.addEventListener('click', () => showPage('input'));

        // Diagnosis option selection
        document.querySelectorAll('input[name="q1"]').forEach((radio) => {
            radio.addEventListener('change', (e) => handleDiagAnswer('q1', e.target.value));
        });
        document.querySelectorAll('input[name="q2"]').forEach((radio) => {
            radio.addEventListener('change', (e) => handleDiagAnswer('q2', e.target.value));
        });
        document.querySelectorAll('input[name="q3"]').forEach((radio) => {
            radio.addEventListener('change', (e) => handleDiagAnswer('q3', e.target.value));
        });

        // Result → Restart
        els.btnRestart.addEventListener('click', () => {
            resetState();
            showPage('home');
        });

        // Upgrade button → Modal
        els.btnUpgrade.addEventListener('click', () => {
            els.modalOverlay.classList.add('active');
        });

        // Modal close
        els.modalClose.addEventListener('click', () => {
            els.modalOverlay.classList.remove('active');
        });

        els.modalOverlay.addEventListener('click', (e) => {
            if (e.target === els.modalOverlay) {
                els.modalOverlay.classList.remove('active');
            }
        });

        // Keyboard: Enter on textarea
        els.userProblem.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && els.userProblem.value.trim()) {
                e.preventDefault();
                els.btnNextDiag.click();
            }
        });
    }

    // ===== Init =====
    function init() {
        bindEvents();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
