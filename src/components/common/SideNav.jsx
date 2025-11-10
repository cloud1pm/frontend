import { NavLink } from 'react-router-dom'

const SideNav = () => {
  const linkStyle = (isActive) => ({
    display:'block',
    padding:'10px 14px',
    borderRadius:8,
    background: isActive ? '#E9E2FF' : 'transparent',
    color: isActive ? '#6B37FF' : '#444',
    textDecoration:'none'
  })
  return (
    <aside style={{ width:220, padding:16, borderRight:'1px solid #eee', background:'#fafafa' }}>
      <NavLink to="/chat" style={({isActive})=>linkStyle(isActive)}>채팅</NavLink>
      <NavLink to="/report" style={({isActive})=>linkStyle(isActive)}>감정 리포트</NavLink>
      <NavLink to="/community" style={({isActive})=>linkStyle(isActive)}>커뮤니티</NavLink>
      <NavLink to="/character" style={({isActive})=>linkStyle(isActive)}>캐릭터</NavLink>
    </aside>
  )
}

export default SideNav
