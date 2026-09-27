(function(){
  var h = React.createElement;
  function Row(p){
    return h('div',{className:'row'},
      h('div',{className:'rk'}, h('b',null,p.label), p.note? h('span',null,p.note):null),
      h('div',{className:'rv'+(p.top?' top':'')+(p.col?' col':'')+(p.className?' '+p.className:''), style:p.style, 'data-surface': /on-brand/.test(p.className||'')?'brand':/on-ink/.test(p.className||'')?'ink':/on-soft/.test(p.className||'')?'soft':undefined}, p.children));
  }
  function Rows(p){ return h('div',{className:'rows'}, p.children); }
  function Note(p){ return h('div',{className:'note'}, p.children); }
  window.Row = Row; window.Rows = Rows; window.Note = Note;
})();
