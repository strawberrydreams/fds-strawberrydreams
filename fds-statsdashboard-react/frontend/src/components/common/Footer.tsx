import styled from 'styled-components';

const FooterWrapper = styled.footer`
    padding: 4rem 0;
    background: var(--header-gradient);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Container = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled.div`
    font-size: 1.25rem;
    font-weight: 700;
    color: white;
`;

const Copyright = styled.div`
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
`;

function Footer() {
    return (
        <FooterWrapper>
            <Container>
                <Logo>
                    <span>FDS Platform</span>
                </Logo>
                <Copyright>© 2025 FDS Platform. All rights reserved.</Copyright>
            </Container>
        </FooterWrapper>
    )
}

export default Footer
