import * as React from 'react';

interface BaseTemplateProps {
  previewText: string;
  children: React.ReactNode;
}

export const BaseTemplate: React.FC<BaseTemplateProps> = ({
  previewText,
  children,
}) => (
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="color-scheme" content="light" />
      <meta name="supported-color-schemes" content="light" />
      <title>{previewText}</title>
    </head>
    <body style={{
      backgroundColor: '#f4f5f7',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '24px',
      color: '#333333',
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <tr>
          <td align="center" style={{ padding: '40px 0' }}>
            <img 
              src="https://i.ibb.co/XkqXzPH/SCR-20240916-tzlu.png" 
              alt="SmartFlash AI Logo" 
              width="150" 
              height="150" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                borderRadius: '12px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                backgroundColor: '#ffffff',
                padding: '10px',
              }} 
            />
          </td>
        </tr>
        <tr>
          <td style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            {children}
          </td>
        </tr>
        <tr>
          <td align="center" style={{ padding: '20px 0', color: '#6b7280', fontSize: '14px' }}>
            © {new Date().getFullYear()} SmartFlash AI. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
  </html>
);
