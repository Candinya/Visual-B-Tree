/*******************静态常量区*******************/

/**
 * 空树模板
 */
const emptyTreeTemplate = `{"keys":[]}`;

/**
 * 样例树模板
 */
const treeTemplate = `{
    "keys": [8],
    "children": [{
        "keys": [4],
        "children": [{
            "keys": [2],
            "children": [{
                "keys": [1]
            }, {
                "keys": [3]
            }]
        }, {
            "keys": [6],
            "children": [{
                "keys": [5]
            }, {
                "keys": [7]
            }]
        }]
    }, {
        "keys": [12],
        "children": [{
            "keys": [10],
            "children": [{
                "keys": [9]
            }, {
                "keys": [11]
            }]
        }, {
            "keys": [14],
            "children": [{
                "keys": [13]
            }, {
                "keys": [15, 16]
            }]
        }]
    }]
}`;

/*******************全局变量区*******************/

/**
 * 页面关闭附加调用函数
 */
let addifunc;

/*******************核心函数区*******************/

/**
 * @method 插入键值
 * @param {any} key 待插入的键值
 * @returns {null}
 */
const treeInsert = (key) => {
    window.bt.root.insert(key);
};

/**
 * @method 删除键值
 * @param {any} key 待删除的键值
 * @returns {null}
 */
const treeRemove = (key) => {
    window.bt.root.remove(key);
};

/**
 * @method 判断键值是否存在
 * @param {any} key 待删除的键值
 * @returns {boolean}
 */
const keyExist = (key) => {
    return window.bt.root.searchKey(key);
};

/*******************辅助函数区*******************/

/**
 * @method 检查树是否被定义
 * @returns {boolean}
 */
const treeCheck = () => {
    return typeof window.bt === 'undefined';
};

/**
 * @method 查找键值
 * @param {array} keys 键值串
 * @returns {null}
 */
const searchKeys = (keys) => {
    checkTree();
    keys.forEach((skey) => {
        checkKey(skey);
        const key = isNumber(skey) ? parseFloat(skey) : skey;
        if (keyExist(key)) {
            alertInfo('success', `键值 ${key} 存在树中`);
        } else {
            alertInfo('warning', `键值 ${key} 不在树中`);
        }
    });
    drawTree();
};

/**
 * @method 插入键值
 * @param {array} keys 键值串
 * @returns {null}
 */
const insertKeys = (keys) => {
    checkTree();
    keys.forEach((skey) => {
        checkKey(skey);
        const key = isNumber(skey) ? parseFloat(skey) : skey;
        if (!keyExist(key)) {
            treeInsert(key);
        } else {
            alertInfo('warning', `键值 ${key} 出现重复`);
        }
    });
    drawTree();
};

/**
 * @method 删除键值
 * @param {array} keys 键值串
 * @returns {null}
 */
const removeKeys = (keys) => {
    checkTree();
    keys.forEach((skey) => {
        checkKey(skey);
        const key = isNumber(skey) ? parseFloat(skey) : skey;
        if (keyExist(key)) {
            treeRemove(key);
        } else {
            alertInfo('warning', `键值 ${key} 不存在`);
        }
    });
    drawTree();
};

/**
 * @method 将树转换成JSON
 * @returns {string} 转换结果
 */
const tree2json = () => {
    checkTree();
    return window.bt.root.toJSON();
};

/**
 * @method 遍历这棵树
 * @returns {string} 遍历结果
 */
const treeTraverse = () => {
    checkTree();
    return JSON.stringify(window.bt.root.traverse());
};

/**
 * @method 判断是否为数值，防止数值被字典序排序
 * @param {any} n 输入的内容
 * @returns {boolean}
 */
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/*******************交互函数区*******************/

/**
 * @method 初始化SVG缩放
 * @returns {null}
 */
const initSVGZoom = () => {
    const svgElement = document.getElementById('tree-canvas').childNodes[6];
    svgPanZoom(svgElement, {controlIconsEnabled: true});
};

/**
 * @method 绘制树
 * @returns {null}
 */
const drawTree = () => {
    const vizData = window.bt.root.toGraphViz();
    const treeCanvas = document.getElementById('tree-canvas');
    treeCanvas.innerHTML = Viz(vizData, "svg");
    initSVGZoom();
};

/**
 * @method 提示消息
 * @param {string} type 消息的类型（成功/提示/错误）
 * @param {string} msg 消息的内容
 * @returns {null}
 */
const alertInfo = (type, msg) => {
    const alertNodeString = `
<section class="${type}">
    <div class="alert-info">${msg}</div>
    <button class="alert-close square" onclick="clickBtnAlertClose(this)">&times;</button>
</section>
    `;
    const alertLayerElement = document.getElementById('alert-layer');
    alertLayerElement.innerHTML += alertNodeString;
};

/**
 * @method 检查树是否被定义
 * @returns {null}
 */
const checkTree = () => {
    if (treeCheck()) {
        alertInfo('warning', '树还没有被初始化');
        throw new Error('树还没有被初始化');
    }
};

/**
 * @method 检查键值是否为空
 * @param {any} key 被检查的键值
 * @returns {null}
 */
const checkKey = (key) => {
    if (!key) {
        alertInfo('error', '键值不能为空');
        throw new Error('空键值');
    }
}

/**
 * @method 初始化树
 * @param {string} template 用于初始化树的模板字符串
 * @returns {null}
 */
const treeInit = (template) => {
    const M = document.getElementById('input-btree-m').value;
    window.bt = new btree.BT(parseInt(M), (a, b) => { return a < b ? -1 : a === b ? 0 : 1; });
    window.bt.root = btree.BN.prototype.fromJSON(bt, JSON.parse(template));
    drawTree();
    enableButtons();
};

/**
 * @method 解锁按钮
 * @returns {null}
 */
const enableButtons = () => {
    toggleButton('btn-edit-search', false);
    toggleButton('btn-edit-add', false);
    toggleButton('btn-edit-del', false);
    toggleButton('btn-show-viz', false);
    toggleButton('btn-show-json', false);
    toggleButton('btn-show-traverse', false);
};

/**
 * @method 调整按钮的状态
 * @param {string} id 按钮的ID
 * @param {string} disable 按钮将被禁用
 * @returns {null}
 */
const toggleButton = (id, disable) => {
    document.getElementById(id).disabled = disable;
};

/**
 * @method 获取键值
 * @returns {array} 键值串
 */
const getKeys = () => {
    const keysContent = document.getElementById('input-edit-keys').value;
    return keysContent.split(",");
};

/**
 * @method 使用模板的初始化
 * @returns {null}
 */
const initUseTemplate = () => {
    const data = document.getElementById('text-area').value;
    treeInit(data);
};

/**
 * @method 显示文本区（共用输入输出）
 * @param {string} title 文本区域对话框的标题
 * @param {boolean} readonly 文本区域是否只读 
 * @param {string} submitText 提交按钮上的文字提示
 * @param {function} [submitFunc] 提交按钮调用的函数
 * @param {string}  [defaultVale] 文本区域里初始状态的内容
 * @returns {null}
 */
const showTextArea = (title, readonly, submitText, submitFunc = null, defaultVale = '') => {
    // 初始化
    const titleElement = document.getElementById('text-title');
    titleElement.innerText = title;
    const areaElement = document.getElementById('text-area');
    areaElement.readOnly = readonly;
    areaElement.value = defaultVale;
    const submitButton = document.getElementById('btn-text-submit');
    submitButton.innerText = submitText;
    // submitButton.addEventListener("click", submitFunc(), {once: true});
    addifunc = submitFunc;

    // 展示
    const pageElement = document.getElementById('text-layer');
    pageElement.classList.add('active');
};

/**
 * @method 关闭文本区
 * @param {function} [addifunc] 额外的附加函数
 * @returns {null}
 */
const closeTextArea = (addifunc) => {
    if (addifunc) {
        addifunc();
    }
    const pageElement = document.getElementById('text-layer');
    pageElement.classList.remove('active');
};

/**
 * @method 开启序列生成工具
 * @returns {null}
 */
const openGenTool = () => {
    const genElement = document.getElementById('form-generate-keys');
    genElement.classList.add('active');
    toggleButton('btn-edit-generate', true);
};

/**
 * @method 关闭序列生成工具
 * @returns {null}
 */
const closeGenTool = () => {
    const genElement = document.getElementById('form-generate-keys');
    genElement.classList.remove('active');
    toggleButton('btn-edit-generate', false);
};

/**
 * @method 生成序列
 * @returns {null}
 */
const generateKeys = () => {
    const targElement = document.getElementById('input-edit-keys');
    const start = parseInt(document.getElementById('input-gen-keys-start').value);
    const end   = parseInt(document.getElementById('input-gen-keys-end').value);
    if (!start || !end) {
        alertInfo('error', '输入无效');
        return;
    }
    let keys = [];
    if (end > start) {
        for (let i = start; i <= end; i++) {
            keys.push(i);
        }
    } else {
        for (let i = start; i >= end; i--) {
            keys.push(i);
        }
    }
    targElement.value = keys.join(',');
};

/**
 * @method 复制文本区域里的内容
 * @returns {null}
 */
const copyTextArea = () => {
    const textArea = document.getElementById('text-area');
    textArea.select();
    if (document.execCommand("copy")) {
        alertInfo('success', '复制成功√');
    } else {
        alertInfo('error', '复制失败');
    }
};

/*******************事件绑定区*******************/

const clickBtnInitEmpty = () => {
    treeInit(emptyTreeTemplate);
};
const clickBtnInitTemplate = () => {
    showTextArea('树的模板（JSON格式）', false, '应用', initUseTemplate, treeTemplate);
};
const clickBtnEditGenerate = () => {
    openGenTool();
};
const clickBtnGenKeys = () => {
    generateKeys();
    closeGenTool();
};
const clickBtnEditSearch = () => {
    searchKeys(getKeys());
};
const clickBtnEditAdd = () => {
    insertKeys(getKeys());
};
const clickBtnEditDel = () => {
    removeKeys(getKeys());
};
const clickBtnShowViz = () => {
    showTextArea('Viz源格式输出', true, '复制', copyTextArea, window.bt.root.toGraphViz());
};
const clickBtnShowJson = () => {
    showTextArea('JSON格式输出', true, '复制', copyTextArea, tree2json());
};
const clickBtnShowTraverse = () => {
    showTextArea('中序遍历结果', true, '复制', copyTextArea, treeTraverse());
};
const clickBtnTextSubmit = () => {
    closeTextArea(addifunc);
};
const clickBtnTextCancel = () => {
    closeTextArea();
};
const clickBtnAlertClose = (btn) => {
    btn.parentElement.remove();
};
