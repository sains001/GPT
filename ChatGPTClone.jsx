import { useState, useRef, useEffect, useCallback } from "react";

const OPENROUTER_API_KEY = "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";
const MODEL = "qwen/qwen3.6-plus:free";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Söhne:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root{
    --bg-primary:#212121;
    --bg-secondary:#2f2f2f;
    --bg-hover:#3a3a3a;
    --bg-input:#2f2f2f;
    --bg-modal:#2f2f2f;
    --bg-sidebar:#171717;
    --text-primary:#ececec;
    --text-secondary:#8e8ea0;
    --text-muted:#6e6e80;
    --border:#444;
    --accent:#6b5aed;
    --accent-btn:#5b4fcf;
    --bubble-user:#2f2f2f;
    --scrollbar:#3a3a3a;
    --radius:12px;
    --sidebar-width:260px;
  }
  html,body,#root{height:100%;width:100%;overflow:hidden;}
  body{
    font-family:'Söhne',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
    background:var(--bg-primary);
    color:var(--text-primary);
    font-size:14px;
    line-height:1.6;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar{width:6px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--scrollbar);border-radius:3px;}

  /* LAYOUT */
  .app{display:flex;height:100vh;width:100vw;overflow:hidden;position:relative;}

  /* SIDEBAR */
  .sidebar{
    width:var(--sidebar-width);
    min-width:var(--sidebar-width);
    background:var(--bg-sidebar);
    display:flex;
    flex-direction:column;
    height:100%;
    padding:8px;
    overflow:hidden;
    transition:width 0.2s ease,min-width 0.2s ease,opacity 0.2s ease;
    position:relative;
    z-index:10;
  }
  .sidebar.collapsed{width:0;min-width:0;opacity:0;pointer-events:none;}
  .sidebar-top{display:flex;align-items:center;justify-content:space-between;padding:4px 4px 8px 4px;gap:4px;}
  .sidebar-logo{display:flex;align-items:center;gap:8px;padding:4px 8px;border-radius:8px;cursor:pointer;transition:background 0.15s;flex:1;}
  .sidebar-logo:hover{background:var(--bg-hover);}
  .sidebar-logo-icon{width:28px;height:28px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .sidebar-logo-text{font-size:14px;font-weight:600;color:var(--text-primary);}
  .sidebar-logo-chevron{color:var(--text-secondary);font-size:10px;margin-left:2px;}
  .icon-btn{
    width:36px;height:36px;border-radius:8px;border:none;background:transparent;
    color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:background 0.15s,color 0.15s;flex-shrink:0;
  }
  .icon-btn:hover{background:var(--bg-hover);color:var(--text-primary);}

  .sidebar-nav{display:flex;flex-direction:column;gap:1px;margin-bottom:4px;}
  .nav-item{
    display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;
    color:var(--text-secondary);cursor:pointer;transition:background 0.15s,color 0.15s;
    font-size:13.5px;white-space:nowrap;user-select:none;
  }
  .nav-item:hover{background:var(--bg-hover);color:var(--text-primary);}
  .nav-item svg{flex-shrink:0;opacity:0.8;}

  .sidebar-section-label{
    font-size:11px;font-weight:600;color:var(--text-muted);
    padding:12px 10px 4px;letter-spacing:0.02em;
  }
  .conv-item{
    display:flex;align-items:center;justify-content:space-between;
    padding:6px 10px;border-radius:8px;cursor:pointer;
    transition:background 0.15s;font-size:13px;color:var(--text-secondary);
    white-space:nowrap;overflow:hidden;group:true;
  }
  .conv-item:hover,.conv-item.active{background:var(--bg-hover);color:var(--text-primary);}
  .conv-item span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .conv-actions{display:none;gap:2px;flex-shrink:0;}
  .conv-item:hover .conv-actions{display:flex;}
  .conv-action-btn{
    width:20px;height:20px;border-radius:4px;border:none;background:transparent;
    color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:11px;transition:color 0.1s,background 0.1s;
  }
  .conv-action-btn:hover{color:var(--text-primary);background:rgba(255,255,255,0.08);}

  .sidebar-footer{margin-top:auto;padding-top:8px;border-top:1px solid var(--border);}
  .user-btn{
    display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;
    cursor:pointer;transition:background 0.15s;width:100%;
  }
  .user-btn:hover{background:var(--bg-hover);}
  .user-avatar{
    width:32px;height:32px;border-radius:50%;background:#5c7cfa;
    display:flex;align-items:center;justify-content:center;font-size:12px;
    font-weight:700;color:#fff;flex-shrink:0;letter-spacing:0.05em;
  }
  .user-info{flex:1;overflow:hidden;}
  .user-name{font-size:13px;font-weight:500;color:var(--text-primary);}
  .user-plan{font-size:11px;color:var(--text-muted);}
  .upgrade-btn{
    background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;
    color:var(--text-secondary);font-size:11px;padding:4px 10px;cursor:pointer;
    white-space:nowrap;transition:background 0.15s,color 0.15s;flex-shrink:0;
  }
  .upgrade-btn:hover{background:var(--bg-hover);color:var(--text-primary);}

  /* MAIN */
  .main{flex:1;display:flex;flex-direction:column;height:100%;overflow:hidden;position:relative;background:var(--bg-primary);}

  /* TOPBAR */
  .topbar{
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 16px;height:52px;flex-shrink:0;
  }
  .topbar-left{display:flex;align-items:center;gap:8px;}
  .topbar-title{
    display:flex;align-items:center;gap:6px;font-size:15px;font-weight:600;
    color:var(--text-primary);cursor:pointer;padding:4px 8px;border-radius:8px;
    transition:background 0.15s;
  }
  .topbar-title:hover{background:var(--bg-hover);}
  .topbar-right{display:flex;align-items:center;gap:4px;}
  .share-btn{
    display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:8px;
    border:1px solid var(--border);background:transparent;color:var(--text-secondary);
    font-size:13px;cursor:pointer;transition:background 0.15s,color 0.15s;
  }
  .share-btn:hover{background:var(--bg-hover);color:var(--text-primary);}

  /* WELCOME */
  .welcome{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;
    padding:20px;gap:32px;overflow:hidden;
  }
  .welcome-title{
    font-size:28px;font-weight:600;color:var(--text-primary);text-align:center;
    animation:fadeInDown 0.4s ease;
  }
  @keyframes fadeInDown{from{opacity:0;transform:translateY(-10px);}to{opacity:1;transform:translateY(0);}}

  /* CHAT AREA */
  .chat-area{
    flex:1;overflow-y:auto;padding:20px 0;
    display:flex;flex-direction:column;gap:0;
    scroll-behavior:smooth;
  }
  .msg-row{
    padding:12px max(calc((100% - 768px)/2), 16px);
    display:flex;gap:12px;align-items:flex-start;
    animation:msgIn 0.25s ease;
  }
  @keyframes msgIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  .msg-row.user{justify-content:flex-end;}
  .msg-bubble-user{
    background:var(--bubble-user);border-radius:18px 18px 4px 18px;
    padding:12px 18px;max-width:70%;font-size:15px;line-height:1.6;
    color:var(--text-primary);word-wrap:break-word;
  }
  .msg-avatar{
    width:28px;height:28px;border-radius:50%;background:#fff;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:4px;
  }
  .msg-content-wrap{max-width:min(768px,100%);flex:1;}
  .msg-text{font-size:15px;line-height:1.7;color:var(--text-primary);word-wrap:break-word;}
  .msg-text p{margin-bottom:0.75em;}
  .msg-text p:last-child{margin-bottom:0;}
  .msg-text code{
    background:rgba(255,255,255,0.1);border-radius:4px;
    padding:2px 5px;font-family:'SF Mono','Fira Code',monospace;font-size:13px;
  }
  .msg-text pre{
    background:rgba(0,0,0,0.4);border-radius:8px;padding:16px;
    overflow-x:auto;margin:8px 0;
  }
  .msg-text pre code{background:transparent;padding:0;}
  .msg-actions{
    display:flex;align-items:center;gap:2px;margin-top:8px;opacity:0;
    transition:opacity 0.15s;
  }
  .msg-row:hover .msg-actions{opacity:1;}
  .msg-action{
    width:28px;height:28px;border-radius:6px;border:none;background:transparent;
    color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:13px;transition:background 0.1s,color 0.1s;
  }
  .msg-action:hover{background:var(--bg-hover);color:var(--text-primary);}
  .msg-action.liked{color:#19c37d;}
  .msg-action.disliked{color:#ef4444;}

  /* THINKING */
  .thinking-wrap{padding:12px max(calc((100% - 768px)/2), 16px);display:flex;gap:12px;align-items:flex-start;}
  .thinking-dots{display:flex;align-items:center;gap:4px;padding:8px 0;}
  .dot{
    width:8px;height:8px;border-radius:50%;background:var(--text-muted);
    animation:bounce 1.2s infinite ease-in-out;
  }
  .dot:nth-child(1){animation-delay:0s;}
  .dot:nth-child(2){animation-delay:0.2s;}
  .dot:nth-child(3){animation-delay:0.4s;}
  @keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.4;}40%{transform:scale(1);opacity:1;}}

  /* CURSOR BLINK */
  .cursor-blink{
    display:inline-block;width:2px;height:16px;background:var(--text-primary);
    margin-left:1px;animation:blink 0.8s infinite;vertical-align:text-bottom;
  }
  @keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}

  /* INPUT AREA */
  .input-area{
    padding:0 16px 16px;flex-shrink:0;
    display:flex;flex-direction:column;align-items:center;
  }
  .input-wrap{
    width:100%;max-width:768px;background:var(--bg-input);
    border-radius:16px;border:1px solid var(--border);
    display:flex;align-items:flex-end;gap:8px;padding:10px 14px;
    transition:border-color 0.15s;position:relative;
  }
  .input-wrap:focus-within{border-color:rgba(255,255,255,0.25);}
  .attach-btn{
    width:32px;height:32px;border-radius:8px;border:none;background:transparent;
    color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;
    font-size:18px;transition:color 0.15s;flex-shrink:0;
  }
  .attach-btn:hover{color:var(--text-primary);}
  .input-field{
    flex:1;background:transparent;border:none;outline:none;resize:none;
    color:var(--text-primary);font-family:inherit;font-size:15px;line-height:1.5;
    max-height:200px;overflow-y:auto;min-height:24px;
    padding:0;
  }
  .input-field::placeholder{color:var(--text-muted);}
  .input-right{display:flex;align-items:center;gap:6px;flex-shrink:0;}
  .voice-btn,.stream-btn{
    width:32px;height:32px;border-radius:50%;border:none;
    display:flex;align-items:center;justify-content:center;cursor:pointer;
    transition:background 0.15s;flex-shrink:0;
  }
  .voice-btn{background:transparent;color:var(--text-muted);}
  .voice-btn:hover{background:var(--bg-hover);color:var(--text-primary);}
  .stream-btn{background:var(--text-primary);color:var(--bg-primary);}
  .stream-btn:hover{background:rgba(255,255,255,0.85);}
  .stream-btn:disabled{background:var(--bg-hover);color:var(--text-muted);cursor:not-allowed;}
  .stop-btn{background:#ef4444;color:#fff;}
  .stop-btn:hover{background:#dc2626;}
  .input-footer{
    font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center;
    max-width:768px;width:100%;
  }

  /* USER MENU */
  .user-menu-overlay{position:fixed;inset:0;z-index:50;}
  .user-menu{
    position:fixed;bottom:56px;left:8px;
    width:260px;background:var(--bg-modal);border:1px solid var(--border);
    border-radius:12px;padding:8px;z-index:51;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    animation:menuIn 0.15s ease;
  }
  @keyframes menuIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
  .user-menu-header{
    display:flex;align-items:center;gap:10px;padding:8px 10px 12px;
    border-bottom:1px solid var(--border);margin-bottom:4px;
  }
  .user-menu-name{font-size:14px;font-weight:500;}
  .user-menu-email{font-size:12px;color:var(--text-muted);}
  .menu-item{
    display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;
    cursor:pointer;transition:background 0.1s;font-size:13.5px;color:var(--text-secondary);
  }
  .menu-item:hover{background:var(--bg-hover);color:var(--text-primary);}
  .menu-item.danger{color:#ef4444;}
  .menu-item.danger:hover{background:rgba(239,68,68,0.1);}
  .menu-divider{height:1px;background:var(--border);margin:4px 0;}

  /* SETTINGS MODAL */
  .modal-overlay{
    position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:60;
    display:flex;align-items:center;justify-content:center;
    animation:overlayIn 0.15s ease;
  }
  @keyframes overlayIn{from{opacity:0;}to{opacity:1;}}
  .modal{
    background:var(--bg-modal);border:1px solid var(--border);border-radius:16px;
    width:680px;max-width:calc(100vw - 32px);max-height:calc(100vh - 48px);
    display:flex;overflow:hidden;
    animation:modalIn 0.2s ease;box-shadow:0 24px 48px rgba(0,0,0,0.5);
  }
  @keyframes modalIn{from{opacity:0;transform:scale(0.97);}to{opacity:1;transform:scale(1);}}
  .modal-close{
    position:absolute;top:16px;left:16px;width:28px;height:28px;border-radius:50%;
    border:none;background:transparent;color:var(--text-muted);cursor:pointer;
    display:flex;align-items:center;justify-content:center;font-size:16px;
    transition:background 0.1s,color 0.1s;
  }
  .modal-close:hover{background:var(--bg-hover);color:var(--text-primary);}
  .modal-sidebar{
    width:200px;padding:48px 8px 16px;flex-shrink:0;
    border-right:1px solid var(--border);background:rgba(0,0,0,0.15);
    overflow-y:auto;
  }
  .modal-tab{
    display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;
    cursor:pointer;transition:background 0.1s;font-size:13px;color:var(--text-secondary);
    margin-bottom:1px;
  }
  .modal-tab:hover{background:var(--bg-hover);color:var(--text-primary);}
  .modal-tab.active{background:var(--bg-hover);color:var(--text-primary);}
  .modal-content{flex:1;padding:32px 28px;overflow-y:auto;position:relative;}
  .modal-section-title{font-size:18px;font-weight:600;margin-bottom:24px;}
  .settings-row{
    display:flex;align-items:center;justify-content:space-between;
    padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.06);
  }
  .settings-row:last-child{border-bottom:none;}
  .settings-label{font-size:14px;color:var(--text-primary);}
  .settings-sublabel{font-size:12px;color:var(--text-muted);margin-top:3px;max-width:340px;}
  .settings-select{
    background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;
    color:var(--text-primary);font-size:13px;padding:6px 28px 6px 10px;cursor:pointer;
    appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238e8ea0' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
    background-repeat:no-repeat;background-position:right 8px center;
    outline:none;
  }
  .settings-select:hover{border-color:rgba(255,255,255,0.25);}
  /* TOGGLE */
  .toggle{
    width:44px;height:24px;border-radius:12px;background:var(--bg-secondary);
    border:1px solid var(--border);cursor:pointer;position:relative;
    transition:background 0.2s;flex-shrink:0;
  }
  .toggle.on{background:#19c37d;border-color:#19c37d;}
  .toggle::after{
    content:'';position:absolute;width:18px;height:18px;border-radius:50%;
    background:#fff;top:2px;left:2px;transition:transform 0.2s;
    box-shadow:0 1px 3px rgba(0,0,0,0.3);
  }
  .toggle.on::after{transform:translateX(20px);}
  /* BADGE */
  .badge{
    font-size:10px;font-weight:600;padding:2px 6px;border-radius:4px;
    background:var(--accent);color:#fff;letter-spacing:0.05em;text-transform:uppercase;
  }
  /* JAILBREAK ROW */
  .jailbreak-label{color:#a78bfa;font-weight:500;}

  /* VOICE BTN PLAY */
  .play-btn{
    display:flex;align-items:center;gap:6px;padding:5px 10px;border-radius:8px;
    border:1px solid var(--border);background:transparent;color:var(--text-secondary);
    font-size:12px;cursor:pointer;transition:background 0.1s;
  }
  .play-btn:hover{background:var(--bg-hover);}

  /* SCROLL TO BOTTOM */
  .scroll-btn{
    position:absolute;bottom:100px;right:20px;width:32px;height:32px;border-radius:50%;
    background:var(--bg-secondary);border:1px solid var(--border);
    color:var(--text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;
    transition:opacity 0.2s,background 0.1s;box-shadow:0 2px 8px rgba(0,0,0,0.3);
    z-index:5;
  }
  .scroll-btn:hover{background:var(--bg-hover);color:var(--text-primary);}

  /* OBTAIN PLUS BTN */
  .plus-btn{
    background:linear-gradient(135deg,#5b4fcf,#7c3aed);color:#fff;border:none;
    border-radius:8px;padding:6px 14px;font-size:13px;font-weight:500;cursor:pointer;
    display:flex;align-items:center;gap:6px;transition:opacity 0.15s;
  }
  .plus-btn:hover{opacity:0.9;}

  /* RESPONSIVE */
  @media(max-width:768px){
    .sidebar{position:absolute;z-index:20;}
    .msg-bubble-user{max-width:90%;}
  }
`;

// ---- ICONS ----
const Icon = {
  ChatGPT: () => (
    <svg width="20" height="20" viewBox="0 0 41 41" fill="none">
      <path d="M37.5 16.6a10.5 10.5 0 00-.9-8.6 10.6 10.6 0 00-11.4-5.1A10.5 10.5 0 0017 .3a10.6 10.6 0 00-10.1 7.3 10.5 10.5 0 00-7 5.1 10.6 10.6 0 001.3 12.4 10.5 10.5 0 00.9 8.6 10.6 10.6 0 0011.4 5.1 10.5 10.5 0 008.2 2.6 10.6 10.6 0 0010.1-7.3 10.5 10.5 0 007-5.1 10.6 10.6 0 00-1.3-12.4z" fill="currentColor"/>
    </svg>
  ),
  NewChat: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15.673 3.913a3.121 3.121 0 114.414 4.414l-5.937 5.937a5 5 0 01-2.828 1.415l-2.18.31a1 1 0 01-1.132-1.13l.311-2.18A5 5 0 019.736 9.85l5.937-5.937zM11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Search: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Images: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/><path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Apps: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>,
  DeepSearch: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" stroke="currentColor" strokeWidth="2"/></svg>,
  Codex: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Projects: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Chevron: ({ dir }) => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d={dir==='down'?"M6 9l6 6 6-6":dir==='right'?"M9 18l6-6-6-6":"M15 18l-6-6 6-6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Sidebar: () => <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M9 3v18" stroke="currentColor" strokeWidth="2"/></svg>,
  Share: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  More: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/><circle cx="12" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="1.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="19" r="1.5" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Mic: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="2"/><path d="M5 10a7 7 0 0014 0M12 21v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Send: () => <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Stop: () => <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>,
  Plus: () => <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Copy: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  ThumbUp: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ThumbDown: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Regen: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Upgrade: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Person: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>,
  Settings: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2"/></svg>,
  Help: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Logout: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Play: () => <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Bell: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Paint: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10M7 12a5 5 0 0010 0" stroke="currentColor" strokeWidth="2"/></svg>,
  Grid: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>,
  Database: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" strokeWidth="2"/><path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  Lock: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Parent: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Account: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>,
  ArrowDown: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Trash: () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m5 0V4a1 1 0 011-1h2a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

// ---- INITIAL CONVERSATIONS ----
const initConvs = {
  "conv-1": { id:"conv-1", title:"Greeting Exchange", messages:[
    {id:"m1",role:"user",content:"hi"},
    {id:"m2",role:"assistant",content:"Hey! How's it going? 😊"},
    {id:"m3",role:"user",content:"hi"},
    {id:"m4",role:"assistant",content:"Hi again! What's on your mind? 😊"},
  ]},
  "conv-2": { id:"conv-2", title:"Greeting Exchange", messages:[
    {id:"m1",role:"user",content:"hi"},
    {id:"m2",role:"assistant",content:"Hey! How's it going? 😊"},
  ]},
};

// ---- SETTINGS MODAL ----
function SettingsModal({ onClose }) {
  const [tab, setTab] = useState("general");
  const [theme, setTheme] = useState("Sombre");
  const [lang, setLang] = useState("auto");
  const [voice, setVoice] = useState("Maple");
  const [voiceMode, setVoiceMode] = useState(false);
  const [jailbreak, setJailbreak] = useState(false);

  const tabs = [
    { id:"general", label:"Général", icon:<Icon.Settings/> },
    { id:"notifs", label:"Notifications", icon:<Icon.Bell/> },
    { id:"perso", label:"Personnalisation", icon:<Icon.Paint/> },
    { id:"apps", label:"Applications", icon:<Icon.Grid/> },
    { id:"data", label:"Gestion des données", icon:<Icon.Database/> },
    { id:"security", label:"Sécurité", icon:<Icon.Lock/> },
    { id:"parental", label:"Contrôles parentaux", icon:<Icon.Parent/> },
    { id:"account", label:"Compte", icon:<Icon.Account/> },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-sidebar">
          <button className="modal-close" onClick={onClose} style={{position:'relative',top:'auto',left:'auto',marginBottom:16}}>✕</button>
          {tabs.map(t=>(
            <div key={t.id} className={`modal-tab ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>
              {t.icon}<span>{t.label}</span>
            </div>
          ))}
        </div>
        <div className="modal-content">
          {tab==="general" && (
            <>
              <div className="modal-section-title">Général</div>
              <div className="settings-row">
                <div className="settings-label">Thème</div>
                <select className="settings-select" value={theme} onChange={e=>setTheme(e.target.value)}>
                  <option>Sombre</option><option>Clair</option><option>Système</option>
                </select>
              </div>
              <div className="settings-row">
                <div className="settings-label">Couleur d'accentuation</div>
                <select className="settings-select">
                  <option>Par défaut</option><option>Bleu</option><option>Violet</option><option>Vert</option>
                </select>
              </div>
              <div className="settings-row">
                <div className="settings-label">Langue</div>
                <select className="settings-select" value={lang} onChange={e=>setLang(e.target.value)}>
                  <option value="auto">Détection automatique</option>
                  <option value="fr">Français</option><option value="en">English</option><option value="ar">Arabic</option>
                </select>
              </div>
              <div className="settings-row" style={{flexDirection:'column',alignItems:'flex-start',gap:8}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%'}}>
                  <div className="settings-label">Langue parlée</div>
                  <select className="settings-select">
                    <option>Détection automatique</option><option>Français</option><option>English</option>
                  </select>
                </div>
                <div className="settings-sublabel">Pour de meilleurs résultats, sélectionnez votre langue principale. Même si elle ne figure pas dans la liste, elle sera peut-être quand même prise en charge via la détection automatique.</div>
              </div>
              <div className="settings-row">
                <div className="settings-label">Voix</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <button className="play-btn"><Icon.Play/> Lire</button>
                  <select className="settings-select" value={voice} onChange={e=>setVoice(e.target.value)}>
                    <option>Maple</option><option>Ember</option><option>Sol</option><option>Breeze</option>
                  </select>
                </div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Mode vocal séparé</div>
                  <div className="settings-sublabel">Afficher ChatGPT Voice dans un écran séparé, sans transcription ni éléments visuels en temps réel.</div>
                </div>
                <div className={`toggle ${voiceMode?'on':''}`} onClick={()=>setVoiceMode(v=>!v)}/>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label jailbreak-label">Jailbreak Mode <span className="badge">BETA</span></div>
                  <div className="settings-sublabel">Enable All Features Of Chatgpt !</div>
                </div>
                <div className={`toggle ${jailbreak?'on':''}`} onClick={()=>setJailbreak(v=>!v)}/>
              </div>
            </>
          )}
          {tab==="notifs" && <><div className="modal-section-title">Notifications</div><div style={{color:'var(--text-muted)',fontSize:14}}>Aucune notification à configurer pour l'instant.</div></>}
          {tab==="perso" && <><div className="modal-section-title">Personnalisation</div><div style={{color:'var(--text-muted)',fontSize:14}}>Personnalisez votre expérience ChatGPT.</div></>}
          {tab==="apps" && <><div className="modal-section-title">Applications</div><div style={{color:'var(--text-muted)',fontSize:14}}>Gérez vos applications connectées.</div></>}
          {tab==="data" && <><div className="modal-section-title">Gestion des données</div>
            <div className="settings-row"><div className="settings-label">Historique des chats</div><button className="play-btn">Désactiver</button></div>
            <div className="settings-row"><div className="settings-label">Exporter les données</div><button className="play-btn">Exporter</button></div>
            <div className="settings-row"><div className="settings-label" style={{color:'#ef4444'}}>Supprimer le compte</div><button className="play-btn" style={{color:'#ef4444',borderColor:'#ef4444'}}>Supprimer</button></div>
          </>}
          {tab==="security" && <><div className="modal-section-title">Sécurité</div><div style={{color:'var(--text-muted)',fontSize:14}}>Paramètres de sécurité du compte.</div></>}
          {tab==="parental" && <><div className="modal-section-title">Contrôles parentaux</div><div style={{color:'var(--text-muted)',fontSize:14}}>Configurez les restrictions pour les mineurs.</div></>}
          {tab==="account" && <><div className="modal-section-title">Compte</div>
            <div className="settings-row"><div className="settings-label">Nom</div><span style={{color:'var(--text-secondary)'}}>MNET</span></div>
            <div className="settings-row"><div className="settings-label">Email</div><span style={{color:'var(--text-secondary)'}}>mnet@user.com</span></div>
            <div className="settings-row"><div className="settings-label">Plan</div><span style={{color:'var(--text-secondary)'}}>Gratuit</span></div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ---- USER MENU ----
function UserMenu({ onClose, onSettings }) {
  return (
    <>
      <div className="user-menu-overlay" onClick={onClose}/>
      <div className="user-menu">
        <div className="user-menu-header">
          <div className="user-avatar" style={{width:36,height:36,fontSize:13}}>MN</div>
          <div><div className="user-menu-name">MNET</div><div className="user-menu-email">@mnet</div></div>
        </div>
        <div className="menu-item"><Icon.Upgrade/> Passer au forfait supérieur</div>
        <div className="menu-item"><Icon.Paint/> Personnalisation</div>
        <div className="menu-divider"/>
        <div className="menu-item"><Icon.Person/> Profil</div>
        <div className="menu-item" onClick={()=>{onSettings();onClose();}}><Icon.Settings/> Paramètres</div>
        <div className="menu-item"><Icon.Help/> Aide <span style={{marginLeft:'auto',color:'var(--text-muted)',fontSize:12}}>›</span></div>
        <div className="menu-divider"/>
        <div className="menu-item danger"><Icon.Logout/> Se déconnecter</div>
      </div>
    </>
  );
}

// ---- MARKDOWN-LIKE TEXT ----
function MsgText({ text, streaming }) {
  const parts = text.split(/(```[\s\S]*?```|`[^`]+`|\*\*[^*]+\*\*|\n)/g);
  const rendered = parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/, '').replace(/```$/, '');
      return <pre key={i}><code>{code}</code></pre>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i}>{part.slice(1,-1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2,-2)}</strong>;
    }
    if (part === '\n') return <br key={i}/>;
    return part;
  });
  return <div className="msg-text">{rendered}{streaming && <span className="cursor-blink"/>}</div>;
}

// ---- MAIN APP ----
export default function ChatGPTClone() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState(initConvs);
  const [activeId, setActiveId] = useState(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [likes, setLikes] = useState({});
  const [showScroll, setShowScroll] = useState(false);
  const chatRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const activeConv = activeId ? conversations[activeId] : null;
  const msgs = activeConv?.messages || [];

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current && isStreaming) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs, isStreaming]);

  const handleScroll = () => {
    if (!chatRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatRef.current;
    setShowScroll(scrollHeight - scrollTop - clientHeight > 200);
  };

  const scrollToBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  const newConversation = () => {
    setActiveId(null);
    setInput('');
    inputRef.current?.focus();
  };

  const deleteConv = (e, id) => {
    e.stopPropagation();
    setConversations(prev => {
      const next = {...prev};
      delete next[id];
      return next;
    });
    if (activeId === id) setActiveId(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput('');

    // Create or get conversation
    let convId = activeId;
    if (!convId) {
      convId = `conv-${Date.now()}`;
      const title = text.length > 30 ? text.slice(0,30)+'...' : text;
      setConversations(prev => ({
        [convId]: { id:convId, title, messages:[] },
        ...prev
      }));
      setActiveId(convId);
    }

    const userMsgId = `m-${Date.now()}-u`;
    const asstMsgId = `m-${Date.now()}-a`;

    // Add user msg
    setConversations(prev => ({
      ...prev,
      [convId]: {
        ...prev[convId],
        messages: [...(prev[convId]?.messages||[]), {id:userMsgId,role:'user',content:text}]
      }
    }));

    // Thinking animation
    setIsThinking(true);
    setIsStreaming(true);
    setStreamingMsgId(asstMsgId);

    // Build messages for API
    const history = (conversations[convId]?.messages || []).map(m => ({
      role: m.role,
      content: m.content
    }));
    history.push({ role:'user', content:text });

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method:"POST",
        signal: controller.signal,
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer":"https://chatgpt-clone.app",
          "X-Title":"ChatGPT Clone"
        },
        body:JSON.stringify({
          model: MODEL,
          messages: history,
          stream: true,
          max_tokens: 1024,
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Add empty assistant msg
      setIsThinking(false);
      setConversations(prev => ({
        ...prev,
        [convId]: {
          ...prev[convId],
          messages:[...(prev[convId]?.messages||[]), {id:asstMsgId,role:'assistant',content:''}]
        }
      }));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while(true) {
        const {done, value} = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullText += delta;
              const ft = fullText;
              setConversations(prev => ({
                ...prev,
                [convId]: {
                  ...prev[convId],
                  messages: prev[convId].messages.map(m =>
                    m.id===asstMsgId ? {...m,content:ft} : m
                  )
                }
              }));
            }
          } catch{}
        }
      }
    } catch(e) {
      if (e.name !== 'AbortError') {
        setIsThinking(false);
        const errMsg = "Désolé, une erreur s'est produite. Veuillez réessayer.";
        setConversations(prev => ({
          ...prev,
          [convId]: {
            ...prev[convId],
            messages:[...(prev[convId]?.messages||[]).filter(m=>m.id!==asstMsgId),
              {id:asstMsgId,role:'assistant',content:errMsg}]
          }
        }));
      }
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      setStreamingMsgId(null);
      abortRef.current = null;
    }
  };

  const stopStreaming = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setIsThinking(false);
    setStreamingMsgId(null);
  };

  const handleKey = e => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMsg = (text) => {
    navigator.clipboard.writeText(text).catch(()=>{});
  };

  const convList = Object.values(conversations);

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen?'':'collapsed'}`}>
          <div className="sidebar-top">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">
                <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
                  <path d="M37.5 16.6a10.5 10.5 0 00-.9-8.6 10.6 10.6 0 00-11.4-5.1A10.5 10.5 0 0017 .3a10.6 10.6 0 00-10.1 7.3 10.5 10.5 0 00-7 5.1 10.6 10.6 0 001.3 12.4 10.5 10.5 0 00.9 8.6 10.6 10.6 0 0011.4 5.1 10.5 10.5 0 008.2 2.6 10.6 10.6 0 0010.1-7.3 10.5 10.5 0 007-5.1 10.6 10.6 0 00-1.3-12.4z" fill="#000"/>
                </svg>
              </div>
              <span className="sidebar-logo-text">ChatGPT</span>
              <span className="sidebar-logo-chevron"><Icon.Chevron dir="down"/></span>
            </div>
            <button className="icon-btn" onClick={newConversation} title="Nouveau chat"><Icon.NewChat/></button>
          </div>

          <div className="sidebar-nav">
            <div className="nav-item"><Icon.NewChat/> Nouveau chat</div>
            <div className="nav-item"><Icon.Search/> Rechercher des chats</div>
            <div className="nav-item"><Icon.Images/> Images</div>
            <div className="nav-item"><Icon.Apps/> Applications</div>
            <div className="nav-item"><Icon.DeepSearch/> Recherche approfondie</div>
            <div className="nav-item"><Icon.Codex/> Codex</div>
            <div className="nav-item"><Icon.Projects/> Projets</div>
          </div>

          {convList.length > 0 && (
            <>
              <div className="sidebar-section-label">Récents</div>
              <div style={{flex:1,overflowY:'auto'}}>
                {convList.map(c => (
                  <div key={c.id} className={`conv-item ${activeId===c.id?'active':''}`} onClick={()=>setActiveId(c.id)}>
                    <span>{c.title}</span>
                    <div className="conv-actions">
                      <button className="conv-action-btn" onClick={e=>deleteConv(e,c.id)} title="Supprimer"><Icon.Trash/></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="sidebar-footer">
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="user-btn" onClick={()=>setShowUserMenu(v=>!v)} style={{flex:1}}>
                <div className="user-avatar">MN</div>
                <div className="user-info">
                  <div className="user-name">MNET</div>
                  <div className="user-plan">Free</div>
                </div>
              </div>
              <button className="upgrade-btn" onClick={()=>setShowSettings(true)}>Mettre à niveau</button>
            </div>
          </div>
        </div>

        {/* MAIN */}
        <div className="main">
          {/* TOPBAR */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="icon-btn" onClick={()=>setSidebarOpen(v=>!v)}><Icon.Sidebar/></button>
              {activeConv ? (
                <div className="topbar-title">
                  ChatGPT <Icon.Chevron dir="down"/>
                </div>
              ) : (
                <div className="topbar-title">
                  ChatGPT <Icon.Chevron dir="down"/>
                </div>
              )}
            </div>
            <div className="topbar-right">
              {activeConv && (
                <button className="share-btn"><Icon.Share/> Partager</button>
              )}
              {!activeConv && (
                <button className="plus-btn">✦ Obtenir Plus</button>
              )}
              {activeConv && (
                <button className="icon-btn"><Icon.More/></button>
              )}
            </div>
          </div>

          {/* CHAT or WELCOME */}
          {!activeConv ? (
            <div className="welcome">
              <div className="welcome-title">Par quoi commençons-nous ?</div>
            </div>
          ) : (
            <div className="chat-area" ref={chatRef} onScroll={handleScroll}>
              {msgs.map((msg, idx) => {
                if (msg.role==='user') return (
                  <div key={msg.id} className="msg-row user">
                    <div className="msg-bubble-user">{msg.content}</div>
                    <div className="user-avatar" style={{width:28,height:28,fontSize:11,marginTop:4,flexShrink:0}}>MN</div>
                  </div>
                );
                return (
                  <div key={msg.id} className="msg-row">
                    <div className="msg-avatar">
                      <svg width="14" height="14" viewBox="0 0 41 41" fill="none">
                        <path d="M37.5 16.6a10.5 10.5 0 00-.9-8.6 10.6 10.6 0 00-11.4-5.1A10.5 10.5 0 0017 .3a10.6 10.6 0 00-10.1 7.3 10.5 10.5 0 00-7 5.1 10.6 10.6 0 001.3 12.4 10.5 10.5 0 00.9 8.6 10.6 10.6 0 0011.4 5.1 10.5 10.5 0 008.2 2.6 10.6 10.6 0 0010.1-7.3 10.5 10.5 0 007-5.1 10.6 10.6 0 00-1.3-12.4z" fill="#000"/>
                      </svg>
                    </div>
                    <div className="msg-content-wrap">
                      <MsgText text={msg.content} streaming={streamingMsgId===msg.id && isStreaming}/>
                      <div className="msg-actions">
                        <button className="msg-action" onClick={()=>copyMsg(msg.content)} title="Copier"><Icon.Copy/></button>
                        <button className={`msg-action ${likes[msg.id]==='up'?'liked':''}`} onClick={()=>setLikes(l=>({...l,[msg.id]:l[msg.id]==='up'?null:'up'}))} title="Bon"><Icon.ThumbUp/></button>
                        <button className={`msg-action ${likes[msg.id]==='down'?'disliked':''}`} onClick={()=>setLikes(l=>({...l,[msg.id]:l[msg.id]==='down'?null:'down'}))} title="Mauvais"><Icon.ThumbDown/></button>
                        <button className="msg-action" title="Partager"><Icon.Share/></button>
                        <button className="msg-action" title="Regénérer"><Icon.Regen/></button>
                        <button className="msg-action" title="Plus"><Icon.More/></button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* THINKING */}
              {isThinking && (
                <div className="thinking-wrap">
                  <div className="msg-avatar">
                    <svg width="14" height="14" viewBox="0 0 41 41" fill="none">
                      <path d="M37.5 16.6a10.5 10.5 0 00-.9-8.6 10.6 10.6 0 00-11.4-5.1A10.5 10.5 0 0017 .3a10.6 10.6 0 00-10.1 7.3 10.5 10.5 0 00-7 5.1 10.6 10.6 0 001.3 12.4 10.5 10.5 0 00.9 8.6 10.6 10.6 0 0011.4 5.1 10.5 10.5 0 008.2 2.6 10.6 10.6 0 0010.1-7.3 10.5 10.5 0 007-5.1 10.6 10.6 0 00-1.3-12.4z" fill="#000"/>
                    </svg>
                  </div>
                  <div className="thinking-dots">
                    <div className="dot"/><div className="dot"/><div className="dot"/>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SCROLL TO BOTTOM */}
          {showScroll && (
            <button className="scroll-btn" onClick={scrollToBottom}><Icon.ArrowDown/></button>
          )}

          {/* INPUT */}
          <div className="input-area">
            <div className="input-wrap">
              <button className="attach-btn"><Icon.Plus/></button>
              <textarea
                ref={inputRef}
                className="input-field"
                placeholder="Poser une question"
                value={input}
                onChange={e=>{ setInput(e.target.value); e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,200)+'px'; }}
                onKeyDown={handleKey}
                rows={1}
              />
              <div className="input-right">
                <button className="voice-btn"><Icon.Mic/></button>
                {isStreaming ? (
                  <button className="stream-btn stop-btn" onClick={stopStreaming}><Icon.Stop/></button>
                ) : (
                  <button className="stream-btn" onClick={sendMessage} disabled={!input.trim()}><Icon.Send/></button>
                )}
              </div>
            </div>
            {activeConv && (
              <div className="input-footer">ChatGPT peut faire des erreurs. Envisagez de vérifier les informations importantes.</div>
            )}
          </div>
        </div>

        {/* USER MENU */}
        {showUserMenu && (
          <UserMenu onClose={()=>setShowUserMenu(false)} onSettings={()=>setShowSettings(true)}/>
        )}

        {/* SETTINGS */}
        {showSettings && (
          <SettingsModal onClose={()=>setShowSettings(false)}/>
        )}
      </div>
    </>
  );
}
