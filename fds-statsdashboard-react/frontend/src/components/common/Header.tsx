import styled from 'styled-components'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// --- Styled Components ---

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--header-gradient);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: 4.5rem;
  display: flex;
  align-items: center;
  padding: 0 2rem;
  justify-content: space-between;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1.25rem;
  font-weight: 700;
  color: white;

  &:hover {
    text-decoration: none;
  }
`;

const LogoImage = styled.img`
  height: 3rem;
  width: auto;
  display: block;
`;

const Na = styled.nav`
  display: flex;
  justify-content: center;
`;

const NavList = styled.ul`
  display: flex;
  align-items: center;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavItem = styled.li`
  position: relative;
`;

const DropdownMenu = styled.ul`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 0.5rem;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 200px;
  list-style: none;
  display: none;
  z-index: 100;

  ${NavItem}:hover &, ${NavItem}:focus-within & {
    display: block;
  }
`;

const NavLink = styled.button`
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const StyledDropdownLink = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background-color: #F8FAFC;
    color: var(--point-blue);
  }
`;

const Caret = styled.span`
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid rgba(255, 255, 255, 0.8);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button<{ $primary?: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  border: ${props => props.$primary ? '1px solid rgba(255,255,255,0.3)' : 'none'};
  background: ${props => props.$primary ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  backdrop-filter: ${props => props.$primary ? 'blur(4px)' : 'none'};

  &:hover {
    background: ${props => props.$primary ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

type HeaderProps = {
  onLoginClick?: () => void
}

function Header({ onLoginClick }: HeaderProps) {
  const { token, logout, user } = useAuth()
  const navigate = useNavigate()

  const handleLogin = () => {
    if (onLoginClick) {
      onLoginClick()
      return
    }
    navigate('/login')
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
      <HeaderWrapper>
        <LogoLink to="/" aria-label="Go to home">
          <LogoImage src="/Iconkitchen_credit.png" alt="FDS logo" />
        </LogoLink>

        <Na aria-label="Main">
          <NavList>
            <NavItem>
              <NavLink type="button">
                입출금 거래
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink type="button">
                계좌 관리
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink type="button">
                사기 신고
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink type="button" aria-haspopup="menu">
                대시보드
                <Caret aria-hidden="true" />
              </NavLink>
              <DropdownMenu role="menu">
                <li>
                  <StyledDropdownLink to="/stats/overview" role="menuitem">
                    사용자 대시보드
                  </StyledDropdownLink>
                </li>
                <li>
                  <StyledDropdownLink to="/stats/snapshots" role="menuitem">
                    스냅샷 히스토리
                  </StyledDropdownLink>
                </li>
                {user?.role === 'ADMIN' && (
                    <>
                      <li>
                        <StyledDropdownLink to="/stats/admin" role="menuitem">
                          관리자 대시보드
                        </StyledDropdownLink>
                      </li>
                      <li>
                        <StyledDropdownLink to="/stats/admin/snapshots" role="menuitem">
                          관리자 스냅샷
                        </StyledDropdownLink>
                      </li>
                    </>
                )}
              </DropdownMenu>
            </NavItem>
            <NavItem>
              <NavLink type="button">
                고객지원
              </NavLink>
            </NavItem>
          </NavList>
        </Na>

        <HeaderActions>
          {token ? (
              <ActionButton type="button" onClick={handleLogout}>
                Logout
              </ActionButton>
          ) : (
              <ActionButton type="button" $primary onClick={handleLogin}>
                Login
              </ActionButton>
          )}
        </HeaderActions>
      </HeaderWrapper>
  )
}

export default Header
