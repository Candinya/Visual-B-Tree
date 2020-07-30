(function(exports){

    /**
     * @class 封装对象BT (B-Tree)
     * @param {number} M 树的阶数（最多几路分叉）
     * @param {function} comparefunc 比较函数
     * @returns {null}
     */
    const BT = exports.BT = function(M, comparefunc) {
        this.M = M;
        this.maxNumberKeys = M - 1;
        this.minNumberKeys = Math.ceil(M / 2) - 1;
        this.root = null;
        this.compare = comparefunc;
    };
    
    /**
     * @class 封装对象BN (B-Tree Node)
     * @param {BT} bt 哪棵B树
     * @param {Array} keys 关键字
     * @param {Array} childres 子树
     * @returns {null}
     */
    const BN = exports.BN = function(bt, keys, children) {
        this.bt = bt;
        this.keys = keys;
        this.children = children;
    };
    
    /**
     * @method 从指定的JSON生成树
     * @param {BT} bt 哪棵B树
     * @param {string} json 指定的JSON格式存储的B树
     * @returns {BN} 根节点标记的一棵B树
     */
    BN.prototype.fromJSON = function(bt, json) {
        return new BN(bt, json.keys, !json.children ? [] : json.children.map(
            function (child) {
                return BN.prototype.fromJSON(bt, child);
            }
        ));
    
    };
    
    /**
     * @method 将当前的树转换成JSON格式
     * @returns {string} 当前B树的JSON格式化（可用于生成）
     */
    BN.prototype.toJSON = function() {
        let cldsb = "[", i = 0;
        for (; i < this.numberKeys(); i++) {
            if (!this.isLeaf()) {
                cldsb += this.children[i].toJSON() + ",";
            }
        }
        if (!this.isLeaf()){
            cldsb += this.children[i].toJSON();
        }
    
        cldsb += "]";

        return ("{\"keys\":" + JSON.stringify(this.keys) + ",\"children\":" + cldsb.toString() + "}").replace(",\"children\":[]","");
    };
    
    /**
     * @method 化为指定格式的字符串（转化成JSON的中间函数）
     * @returns {string} 指定格式的字符串
     */
    BN.prototype.toString = function() {
        return "BN(keys=" + JSON.stringify(this.keys) + ", children=" + JSON.stringify(this.children.map(function(child) { return child.numberKeys(); })) + ")";
    };
    
    /**
     * @method 遍历当前树
     * @returns {Array} 中序遍历结果数组
     */
    BN.prototype.traverse = function() {
        let acc = [], i = 0;
        for (; i < this.numberKeys(); i++) {
            if (this.children[i]) {
                acc = acc.concat(this.children[i].traverse());
            }
            acc.push(this.keys[i]);
        }
        if (this.children[i]) {
            acc = acc.concat(this.children[i].traverse());
        }
        return acc;
    };
    
    /**
     * @method 递归寻找极大值
     * @returns {any} 极大值
     */
    BN.prototype.findLargest = function() {
        if (this.isLeaf()) {
            return this.keys[this.numberKeys()-1];
        } else {
            return this.children[this.numberKeys()].findLargest();
        }
    };
    
    /**
     * @method 递归寻找极小值
     * @returns {any} 极小值
     */
    BN.prototype.findSmallest = function() {
        if (this.isLeaf()) {
            return this.keys[0];
        } else {
            return this.children[0].findSmallest();
        }
    };
    
    /**
     * @method 递归寻找给定值
     * @param {any} K 指定的键值
     * @returns {boolean} 是否寻找到
     */
    BN.prototype.searchKey = function(K) {
        const pos = this.keys.indexOf(K);
        // 在当前节点中寻找
        if (pos !== -1) {
            // 找到了
            return true;
        } else if (this.isLeaf()) {
            // 是叶节点同时找不到
            return false;
        } else {
            // 不在这里
            const nextTry = this.findChildSlot(K);
            return this.children[nextTry].searchKey(K);
        }
    };
    
    /**
     * @method 将树转换成Viz.js指定的格式，以便于绘图
     * @returns {string} 树的viz格式字符串
     */
    BN.prototype.toGraphViz = function() {
        const writer = new Writer();
    
        this.walk(new Counter(), writer);
    
        return `digraph g {
node [shape = record,height=.1];
${writer.buf}
}`;
    };
    
    /**
     * @method 递归遍历每一个节点（Viz格式转化的中间函数）
     * @returns {string} 树的viz格式字符串
     */
    BN.prototype.walk = function(counter, writer) {
        const nodeid = "node" + String(counter.add()) ;
        writer.write(nodeid + "[label = \"");
        let i = 0;
        for (; i<this.numberKeys(); i++) {
            writer.write("<f" + String(i) + "> |");
            writer.write(String(this.keys[i]));
            writer.write("|");
        }
        writer.writeln("<f" + String(i) + ">\"];");
    
        let childNum = -1;
        // const outer = this;
        this.children.forEach(function(child) {
            childNum++;
            const childnodeid = child.walk(counter, writer);
            writer.writeln("\"" + nodeid + "\":f" + String(childNum) + " -> \"" + childnodeid + "\"");
        });
    
        return nodeid;
    };
    
    /**
     * @method 删除一个键值
     * @param {any} K 指定的键值
     * @returns {null}
     */
    BN.prototype.remove = function(K) {
        // 由于合并算法比较复杂，无法有效封装，只能写成如下的分情况讨论形式。
        // 同时，当出现奇数度数的时候，由于无法定位中间点，会导致合并后的子树超出限制范围，因此需要专门进行分裂处理。
        // 参考的程式使用的是对半扩增的设计，保证了是偶度数，所以不存在奇偶相关的限制与错误。
        // 判断是否存在
        // if (!this.searchKey(K)) {
        //     // 不存在的
        //     console.log('无法删除不存在的关键词。');
        //     return;
        // }

        // 沿用原先代码即可
        const pos = this.keys.indexOf(K);
        if (pos !== -1) {
            // 关键词在当前节点中
            if (this.isLeaf()) {
                // 是叶节点，直接删除
                this.keys.splice(pos, 1);
                return null;
            } else {
                // 是中间节点
                if (this.children[pos].numberKeys() > Math.ceil(this.bt.M / 2) - 1) {
                    // 前驱
                    const k_strich = this.children[pos].findLargest();
                    this.keys[pos] = k_strich;
                    return this.children[pos].remove(k_strich);
                } else if (this.children[pos+1].numberKeys() > Math.ceil(this.bt.M / 2) - 1) {
                    // 后继
                    const k_strich = this.children[pos+1].findSmallest();
                    this.keys[pos] = k_strich;
                    return this.children[pos+1].remove(k_strich);
                } else {
                    // 在中间
                    this.children[pos].keys = this.children[pos].keys.concat(this.keys[pos]).concat(this.children[pos+1].keys);
                    this.children[pos].children = this.children[pos].children.concat(this.children[pos+1].children);
                    for (let i = pos; i < this.numberKeys(); i++) {
                        this.keys[i] = this.keys[i+1];
                        this.children[i+1] = this.children[i+2];
                    }
                    this.keys = this.keys.filter(function(v) { return typeof(v) !== "undefined"; });
                    this.children = this.children.filter(function(v) { return typeof(v) !== "undefined"; });
                    if (this.numberKeys() === 0) {
                        this.bt.root = this.children[pos];
                    }
                    return this.children[pos].remove(K);
                }
            }
        } else {
            // 不在当前节点
            const i = this.findChildSlot(K);
            let j = i;
            // 选择子树
            let destnode = this.children[i];
            let siblings = [];
    
            if (typeof(this.children[i-1]) !== "undefined") {
                siblings.push(this.children[i-1]);
            }
            if (typeof(this.children[i+1]) !== "undefined") {
                siblings.push(this.children[i+1]);
            }
            const firstSibling = siblings[0];
    
            if (destnode && destnode.isEmpty()) {
                if (siblings.every(function(sibling){ return sibling.isEmpty(); })) {
                    const firstSiblingPos = this.children.indexOf(firstSibling);
                    const l = Math.min(firstSiblingPos, j);
                    if (firstSiblingPos < this.children.indexOf(destnode)) {
                        destnode.keys = firstSibling.keys.concat(this.keys.splice(l,1)).concat(destnode.keys);
                        destnode.children = firstSibling.children.concat(destnode.children);
                    } else {
                        destnode.keys = destnode.keys.concat(this.keys.splice(l,1)).concat(firstSibling.keys);
                        destnode.children = destnode.children.concat(firstSibling.children);
                    }
                    this.children.splice(firstSiblingPos, 1);
                    if (this.keys.length === 0 && this == this.bt.root) {
                        this.bt.root = destnode;
                    }

                } else {
                    const hat_t = siblings.filter(function(sibling) { return !sibling.isEmpty(); })[0]; // 第一个非空的同级节点
                    const goingRight = this.children.indexOf(hat_t) < this.children.indexOf(destnode);
                    j -= goingRight;
                    if (j < 0) {
                        j = 0;
                    }
                    if (goingRight) {
                        // 向右侧合并
                        destnode.keys = [this.keys[j]].concat(destnode.keys);
                        this.keys[j] = hat_t.keys.splice(hat_t.numberKeys()-1, 1)[0];
                        destnode.children = hat_t.children.splice(hat_t.numberKeys()+1, 1).concat(destnode.children);
                    } else {
                        // 向左侧合并
                        destnode.keys = destnode.keys.concat(this.keys[j]);
                        this.keys[j] = hat_t.keys.splice(0, 1)[0];
                        destnode.children = destnode.children.concat(hat_t.children.splice(0, 1)); 
                    }

                }
            }
            return destnode.remove(K);
        }
    };
    
    /**
     * @method 寻找数值在当前节点中后续子树应该所在的位置
     * @param {any} K 指定的键值
     * @returns {number} 应该所在的位置
     */
    BN.prototype.findChildSlot = function(K) {
        let i = 0;
        for (; i < this.numberKeys(); i++) {
            if (this.bt.compare(this.keys[i], K) !== -1) {
                // 大于等于
                break;
            }
        }
        return i;
    };
    
    /**
     * @method 插入一个键值
     * @param {any} K 指定的键值
     * @returns {null}
     */
    BN.prototype.insert = function(K) {
        // 判断是否存在
        // if (this.searchKey(K)) {
        //     // 已经存在
        //     console.log('该关键词已经存在。');
        //     return;
        // }

        // // 使用了预分裂优化的模式
        // if (this === this.bt.root && this.isFull()) {
        //     this.bt.root = new BN(this.bt, [], [this]);
        //     this.bt.root.splitChild(0);
        //     return this.bt.root.insert(K);
        // }
    
        // const pos = this.findChildSlot(K);
    
        // if (this.isLeaf()) {
        //     this.keys = this.keys.slice(0,pos).concat(K).concat(this.keys.slice(pos));
        //     return;
        // } else {
        //     let destnode;
        //     if (this.children[pos].isFull()) {
        //         const median = this.splitChild(pos);
        //         destnode = this.bt.compare(K, median) === -1 ? this.children[pos] : this.children[pos+1];
        //     } else {
        //         destnode = this.children[pos];
        //     }
        //     return destnode.insert(K);
        // }

        // 由于考虑到2-3树的特殊性，只能使用后分裂算法；
        const pos = this.findChildSlot(K);
        if (this.isLeaf()) {
            // 插入到叶节点
            this.keys = this.keys.slice(0, pos).concat(K).concat(this.keys.slice(pos));
        } else {
            let destnode = this.children[pos];
            destnode.insert(K);
            if (destnode.isOverflow()) {
                this.splitChild(pos);
            }
        }
        
        if (this === this.bt.root && this.isOverflow()) {
            // 分裂根节点
            this.bt.root = new BN(this.bt, [], [this]);
            this.bt.root.splitChild(0);
        }

        return;
    };
    
    /**
     * @method 分裂指定位置的子树
     * @param {number} idx 指定的子树位置
     * @returns {any} 分裂之后指定位置的键值
     */
    BN.prototype.splitChild = function(idx) {
        const part1keys = this.children[idx].keys.slice(0, Math.round(this.bt.M / 2) - 1);
        const part1children = this.children[idx].children.slice(0, Math.round(this.bt.M / 2));
    
        const part2keys = this.children[idx].keys.slice(Math.round(this.bt.M / 2));
        const part2children = this.children[idx].children.slice(Math.round(this.bt.M / 2));
    
        this.keys = this.keys.slice(0, idx).concat(this.children[idx].keys[Math.round(this.bt.M / 2)-1]).concat(this.keys.slice(idx));
        this.children = this.children.slice(0, idx).concat([
                new BN(this.bt, part1keys, part1children),
                new BN(this.bt, part2keys, part2children),
            ]).concat(this.children.slice(idx + 1));
        return this.keys[idx];
    };
    
    /**
     * @method 判断当前节点是否已满（用于预先分裂的优化模式算法）
     * @returns {boolean} 是否已满
     */
    BN.prototype.isFull = function() {
        return this.numberKeys() === this.bt.maxNumberKeys;
    };
    
    /**
     * @method 判断当前节点是否溢出（用于后分裂算法）
     * @returns {boolean} 是否溢出
     */
    BN.prototype.isOverflow = function() {
        return this.numberKeys() > this.bt.maxNumberKeys;
    };
    
    /**
     * @method 判断当前节点是否为空（用于合并算法）
     * @returns {boolean} 是否为空
     */
    BN.prototype.isEmpty = function() {
        return this.numberKeys() === this.bt.minNumberKeys;
    };
    
    /**
     * @method 统计键值的数量
     * @returns {number} 键值的数量
     */
    BN.prototype.numberKeys = function() {
        return this.keys.length;
    };
    
    /**
     * @method 判断是否为叶节点
     * @returns {boolean} 是否为叶节点
     */
    BN.prototype.isLeaf = function() {
        return this.children.length === 0;
    };

    
    /**
     * @class 字符串缓冲
     */
    function Writer() {
        this.buf = "";
    }
    
    /**
     * @method 写入字符串
     * @param {string} str 待写入的字符串
     * @returns {null}
     */
    Writer.prototype.write = function(str) {
        this.buf += String(str);
    };
    
    /**
     * @method 写入字符串并换行
     * @param {string} str 待写入的字符串
     * @returns {null}
     */
    Writer.prototype.writeln = function(str) {
        this.write(String(str) + "\n");
    };


    /**
     * @class 计数器
     */
    function Counter() {
        this.count = 0;
    }
    
    /**
     * @method 计数器自增
     * @returns {null}
     */
    Counter.prototype.add = function() {
        return this.count++;
    };
    
    })(typeof exports === 'undefined'? this['btree']={}: exports);
    