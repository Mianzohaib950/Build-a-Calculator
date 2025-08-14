(function(){
      const displayEl = document.getElementById('display');
      const historyEl = document.getElementById('history');
      const previewEl = document.getElementById('preview');
      const keys = document.querySelectorAll('.key');

      let expr = '';
      let lastResult = null;

      function updateScreen(){
        displayEl.textContent = expr === '' ? '0' : expr;
        historyEl.textContent = expr || '';
        // compute preview
        const sanitized = toJsExpression(expr);
        if(sanitized === '' || /[^0-9+\-*/(). ]/.test(sanitized)){
          previewEl.textContent = '= 0';
          return;
        }
        try{
          // eslint-disable-next-line no-new-func
          const val = Function('return (' + sanitized + ')')();
          if(Number.isFinite(val)) previewEl.textContent = '= ' + formatNumber(val);
          else previewEl.textContent = '= 0';
        }catch(e){
          previewEl.textContent = '= —';
        }
      }

      function toJsExpression(s){
        // converts calculator symbols to JS operators and strips invalid chars
        if(!s) return '';
        let t = s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-');
        // allow digits, operators, parentheses, decimal point and spaces
        t = t.replace(/[^0-9+\-*/(). ]/g,'');
        return t;
      }

      function formatNumber(n){
        // limit long floats and use locale formatting for readability
        if(Math.abs(n) < 1e12 && Number.isInteger(n) === false){
          return parseFloat(n.toFixed(10)).toString();
        }
        return n.toLocaleString();
      }

      function pressValue(val){
        // prevent leading zeros like 0002
        if(val === '.' && /\.$/.test(expr)) return;
        expr += val;
        updateScreen();
      }

      function clearAll(){ expr = ''; lastResult = null; updateScreen(); }
      function delChar(){ expr = expr.slice(0,-1); updateScreen(); }

      function toggleParen(){
        // simple smart parentheses: add '(' if count('(') <= count(')') else add ')'
        const open = (expr.match(/\(/g) || []).length;
        const close = (expr.match(/\)/g) || []).length;
        expr += open <= close ? '(' : ')';
        updateScreen();
      }

      function evaluate(){
        const jsExpr = toJsExpression(expr);
        if(jsExpr === '') return;
        try{
          // eslint-disable-next-line no-new-func
          const val = Function('return (' + jsExpr + ')')();
          if(Number.isFinite(val)){
            lastResult = val;
            expr = '' + val; // show result as new expression
            updateScreen();
          }else{
            displayEl.textContent = 'Error';
          }
        }catch(e){
          displayEl.textContent = 'Error';
        }
      }

      // add button click handlers
      keys.forEach(k => {
        k.addEventListener('click', ()=>{
          const v = k.dataset.value;
          const action = k.dataset.action;
          if(action === 'clear') { clearAll(); return; }
          if(action === 'del') { delChar(); return; }
          if(action === 'paren') { toggleParen(); return; }
          if(action === 'equals') { evaluate(); return; }
          if(v) pressValue(v);
        });
      });

      // keyboard support
      window.addEventListener('keydown', (e)=>{
        // numbers and operators
        if((e.key >= '0' && e.key <= '9') || ['+','-','*','/','(',')','.'].includes(e.key)){
          e.preventDefault();
          // map * and / to our display symbols for prettiness
          const map = {'*':'×','/':'÷','-':'−'};
          const ch = map[e.key] || e.key;
          pressValue(ch);
          return;
        }
        if(e.key === 'Enter' || e.key === '='){
          e.preventDefault(); evaluate(); return;
        }
        if(e.key === 'Backspace'){
          e.preventDefault(); delChar(); return;
        }
        if(e.key === 'Escape'){
          e.preventDefault(); clearAll(); return;
        }
      });

      // initialize
      updateScreen();

    })();
    // Simple calculator logic with real-time preview and keyboard support
    