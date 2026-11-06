import { render } from '@testing-library/react';

jest.mock(
  'react-router-dom',
  () => ({
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: () => <div>Route</div>,
    Navigate: () => <div>Navigate</div>,
    useLocation: () => ({ pathname: '/' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
  }),
  { virtual: true }
);

jest.mock('agora-rtc-sdk-ng', () => ({}), { virtual: true });

test('sanity test passes', () => {
  expect(true).toBe(true);
});
