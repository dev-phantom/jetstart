/**
 * Mock DSL Data
 * Sample DSL definitions for testing and development
 */

export const mockDSLHelloWorld = `{
  "version": "1.0",
  "screen": {
    "type": "Column",
    "modifier": {
      "fillMaxSize": true,
      "padding": 16
    },
    "horizontalAlignment": "CenterHorizontally",
    "verticalArrangement": "Center",
    "children": [
      {
        "type": "Text",
        "text": "Welcome to JetStart! 🚀",
        "style": "headlineMedium",
        "color": "#6366f1"
      },
      {
        "type": "Spacer",
        "height": 16
      },
      {
        "type": "Text",
        "text": "Edit this code and save to see hot reload!",
        "style": "bodyMedium",
        "color": "#6b7280"
      },
      {
        "type": "Spacer",
        "height": 24
      },
      {
        "type": "Button",
        "text": "Click Me!",
        "onClick": "handleClick",
        "modifier": {
          "fillMaxWidth": true
        }
      }
    ]
  }
}`;

export const mockDSLComplex = `{
  "version": "1.0",
  "screen": {
    "type": "Column",
    "modifier": {
      "fillMaxSize": true
    },
    "children": [
      {
        "type": "Box",
        "modifier": {
          "fillMaxWidth": true,
          "padding": 16
        },
        "contentAlignment": "Center",
        "children": [
          {
            "type": "Text",
            "text": "Dashboard",
            "style": "titleLarge"
          }
        ]
      },
      {
        "type": "Row",
        "modifier": {
          "fillMaxWidth": true,
          "padding": 16
        },
        "horizontalArrangement": "SpaceBetween",
        "children": [
          {
            "type": "Column",
            "modifier": {
              "weight": 1
            },
            "children": [
              {
                "type": "Text",
                "text": "Users",
                "style": "titleMedium"
              },
              {
                "type": "Text",
                "text": "1,234",
                "style": "headlineMedium",
                "color": "#10b981"
              }
            ]
          },
          {
            "type": "Column",
            "modifier": {
              "weight": 1
            },
            "children": [
              {
                "type": "Text",
                "text": "Revenue",
                "style": "titleMedium"
              },
              {
                "type": "Text",
                "text": "$45,678",
                "style": "headlineMedium",
                "color": "#6366f1"
              }
            ]
          }
        ]
      },
      {
        "type": "Spacer",
        "height": 24
      },
      {
        "type": "Button",
        "text": "Refresh Data",
        "onClick": "refreshData",
        "modifier": {
          "padding": 16
        }
      }
    ]
  }
}`;
