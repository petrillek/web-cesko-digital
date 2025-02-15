import styled from "styled-components";

export const Container = styled.div`
  box-sizing: content-box;
  width: calc(100% - 64px);
  margin: auto;
  padding: 32px;
  background-color: ${({ theme }) => theme.colors.pebble};
  border-radius: ${({ theme }) => theme.borderRadius.base}px;
`;

export const Title = styled.h2`
  margin: 32px 0 20px;
  font-size: ${({ theme }) => theme.fontSizes.base}px;
`;
export const Wrapper = styled.div`
  display: flex;
  width: 297px;
  justify-content: space-between;
  align-items: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 100%;
  }
`;

export const Social = styled.div`
  display: flex;
  width: 280px;
  flex-direction: column;
`;

export const ButtonWrapper = styled.div`
  margin-top: 12px;
  max-width: 300px;
  a {
    width: 100%;
    justify-content: center;
  }
  svg {
    width: 50px;
  }
`;

export const InnerText = styled.span`
  margin-right: 10px;
  font-weight: ${({ theme }) => theme.fontWeights.body};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
