export const templates = {
  balance: {name:'资产负债全景', description:'资产 → 资金归属 → 净资产与负债', nodes:[['cash','现金与存款',0,'#62b9a0'],['invest','投资资产',0,'#759fda'],['home','房产',0,'#aaa0d5'],['total','总资产',1,'#4a8278'],['equity','净资产',2,'#62b9a0'],['debt','负债',2,'#dfab79']], links:[['cash','total',180000],['invest','total',420000],['home','total',1200000],['total','equity',1100000],['total','debt',700000]], assets:1800000, liabilities:700000},
  flow: {name:'月度现金流', description:'单向布局 · 收入、支出与长期储蓄', nodes:[['salary','工资收入',0,'#62b9a0'],['other','其他收入',0,'#91c5b5'],['budget','月度可用资金',1,'#4a8278'],['life','生活支出',2,'#dfab79'],['loan','还贷',2,'#c98f88'],['saving','长期储蓄',2,'#759fda'],['invest','定投',2,'#aaa0d5']], links:[['salary','budget',25000],['other','budget',3000],['budget','life',9000],['budget','loan',7000],['budget','saving',7000],['budget','invest',5000]], assets:1800000, liabilities:700000},
  center: {name:'财富配置地图', description:'中间向两侧 · 左侧负债，右侧资产', nodes:[['mortgage','住房贷款',0,'#dfab79'],['credit','其他负债',0,'#c98f88'],['wealth','家庭财务',1,'#4a8278'],['cash','现金与存款',2,'#62b9a0'],['fund','股票与基金',2,'#759fda'],['house','房产',2,'#aaa0d5']], links:[['wealth','mortgage',680000],['wealth','credit',20000],['wealth','cash',180000],['wealth','fund',420000],['wealth','house',1200000]], assets:1800000, liabilities:700000},
  two: {name:'双向资金往来', description:'双向布局 · 转入与转出分别呈现', nodes:[['income','收入账户',0,'#62b9a0'],['redeem','投资赎回',0,'#aaa0d5'],['account','资金账户',1,'#4a8278'],['spend','日常支出',2,'#dfab79'],['buy','投资买入',2,'#759fda']], links:[['income','account',25000],['redeem','account',5000],['account','spend',12000],['account','buy',18000]], assets:1800000, liabilities:700000}
};
export function createProject(key='balance') {
 const t=templates[key];return {version:1,title:t.name,template:key,assets:t.assets,liabilities:t.liabilities,date:new Date().toISOString().slice(0,10),nodes:t.nodes.map(([id,name,column,color])=>({id,name,column,color})),links:t.links.map(([source,target,value])=>({source,target,value}))};
}
export function validate(p) {
 if(!p || p.version!==1 || typeof p.title!=='string' || p.title.length>100 || !templates[p.template] || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) throw Error('文件不是有效的财务方案');
 if(!Array.isArray(p.nodes)||p.nodes.length<2||p.nodes.length>30||!Array.isArray(p.links)||p.links.length>80) throw Error('需要 2–30 个节点，最多 80 条资金流');
 const ids=new Set();for(const n of p.nodes){if(typeof n.id!=='string'||!n.id||ids.has(n.id)||typeof n.name!=='string'||!n.name.trim()||n.name.length>40||![0,1,2].includes(n.column)||!/^#[0-9a-f]{6}$/i.test(n.color))throw Error('节点名称、标识、位置或颜色无效');ids.add(n.id);}
 for(const l of p.links)if(!ids.has(l.source)||!ids.has(l.target)||l.source===l.target||!Number.isFinite(l.value)||l.value<=0||l.value>1e12||p.nodes.find(n=>n.id===l.source).column===p.nodes.find(n=>n.id===l.target).column)throw Error('资金流需连接不同列的节点，金额须大于 0 且不超过一万亿');
 for(const k of ['assets','liabilities'])if(!Number.isFinite(p[k])||p[k]<0||p[k]>1e12)throw Error('资产与负债须为 0 至一万亿的金额');return p;
}
export function layout(p,width=1000,height=460){
 const nodes=p.nodes.map(n=>({...n,in:0,out:0}));const map=new Map(nodes.map(n=>[n.id,n]));
 p.links.forEach(l=>{map.get(l.source).out+=l.value;map.get(l.target).in+=l.value;});nodes.forEach(n=>n.value=Math.max(n.in,n.out,1));
 const groups=[0,1,2].map(c=>nodes.filter(n=>n.column===c));
 const scale=Math.min(...groups.filter(g=>g.length).map(g=>(height-70-(g.length-1)*28)/g.reduce((s,n)=>s+n.value,0)));
 groups.forEach((g,c)=>{let y=(height-(g.reduce((s,n)=>s+n.value*scale,0)+(g.length-1)*28))/2;g.forEach(n=>{n.x=125+c*(width-250)/2;n.y=y;n.h=n.value*scale;n.si=0;n.ti=0;y+=n.h+28;});});
 const links=p.links.map(l=>{const s=map.get(l.source),t=map.get(l.target),h=l.value*scale;const reverse=s.x>t.x;const x1=s.x+(reverse?0:16),x2=t.x+(reverse?16:0),y1=s.y+s.si+h/2,y2=t.y+t.ti+h/2;s.si+=h;t.ti+=h;const mid=(x1+x2)/2;return {...l,h,path:`M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`};});return {nodes,links};
}
