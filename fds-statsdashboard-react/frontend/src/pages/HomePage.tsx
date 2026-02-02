import styled from 'styled-components'

const PageWrapper = styled.div`
  min-height: 100vh;
`;

const HeroSection = styled.section`
  padding: 8rem 0 6rem;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 100vw;
    height: 100vh;
    background: radial-gradient(circle at center, rgba(79, 70, 229, 0.1) 0%, transparent 60%);
    z-index: -1;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #111827;
`;

const GradientText = styled.span`
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroDescription = styled.p`
  font-size: 1.25rem;
  max-width: 640px;
  margin: 0 auto 2.5rem;
  color: #4B5563;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 9999px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  background: ${props => props.$primary ? 'var(--accent-gradient)' : 'var(--bg-secondary)'};
  color: ${props => props.$primary ? 'white' : 'var(--text-primary)'};
  box-shadow: ${props => props.$primary ? '0 4px 14px 0 rgba(79, 70, 229, 0.3)' : 'none'};

  &:hover {
    transform: translateY(-1px);
    ${props => !props.$primary && 'background-color: #E5E7EB;'}
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 0;
  background-color: #F8FAFC;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin-bottom: 1rem;
  color: #0F172A;
`;

const SectionSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748B;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background: var(--card-gradient);
  padding: 2rem;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.8);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(139, 92, 246, 0.3);
  }
`;

const FeatureIcon = styled.div<{ $bg: string; $color: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  background: ${props => props.$bg};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
`;

const FeatureDescription = styled.p`
  color: var(--text-secondary);
  line-height: 1.6;
`;

function HomePage() {
  return (
      <PageWrapper>
        {/* Hero Section */}
        <HeroSection>
          <Container>
            <HeroTitle>
              Secure your assets with <br/>
              <GradientText>Intelligent Fraud Detection</GradientText>
            </HeroTitle>
            <HeroDescription>
              Real-time monitoring and AI-driven analysis to protect your financial transactions.
              Experience the next generation of safe banking.
            </HeroDescription>
            <ButtonGroup>
              <Button $primary>Get Started</Button>
              <Button>View Demo</Button>
            </ButtonGroup>
          </Container>
        </HeroSection>

        {/* Features Section */}
        <FeaturesSection>
          <Container>
            <SectionHeader>
              <SectionTitle>
                Advanced Security Features
              </SectionTitle>
              <SectionSubtitle>Comprehensive protection for every transaction.</SectionSubtitle>
            </SectionHeader>

            <Grid>
              {/* Card 1 */}
              <Card>
                <FeatureIcon $bg="rgba(79, 70, 229, 0.1)" $color="#4F46E5">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </FeatureIcon>
                <FeatureTitle>Real-time Monitoring</FeatureTitle>
                <FeatureDescription>Instant analysis of transaction patterns to detect anomalies as they happen.</FeatureDescription>
              </Card>

              {/* Card 2 */}
              <Card>
                <FeatureIcon $bg="rgba(147, 51, 234, 0.1)" $color="#9333EA">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </FeatureIcon>
                <FeatureTitle>Secure Vault</FeatureTitle>
                <FeatureDescription>Bank-grade encryption ensures your sensitive data and assets remain protected.</FeatureDescription>
              </Card>

              {/* Card 3 */}
              <Card>
                <FeatureIcon $bg="rgba(236, 72, 153, 0.1)" $color="#EC4899">
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </FeatureIcon>
                <FeatureTitle>Instant Alerts</FeatureTitle>
                <FeatureDescription>Receive immediate notifications via SMS or App push for any suspicious activity.</FeatureDescription>
              </Card>
            </Grid>
          </Container>
        </FeaturesSection>
      </PageWrapper>
  )
}

export default HomePage
