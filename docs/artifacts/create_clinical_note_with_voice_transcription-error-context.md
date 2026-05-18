# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e4]:
    - button "Open user menu" [ref=e11] [cursor=pointer]:
      - img "Anthony Smith's logo" [ref=e14]
  - generic [ref=e17]:
    - generic [ref=e19]:
      - link "Home" [ref=e20] [cursor=pointer]:
        - /url: /clinical/home
        - img [ref=e21]
        - paragraph [ref=e23]: Home
      - link "Patients" [ref=e24] [cursor=pointer]:
        - /url: /clinical/patients
        - img [ref=e25]
        - paragraph [ref=e27]: Patients
      - link "Appointment Dashboard" [ref=e28] [cursor=pointer]:
        - /url: /clinical/expert-dashboard
        - img [ref=e29]
        - paragraph [ref=e31]: Appointment Dashboard
      - link "Help Center" [ref=e32] [cursor=pointer]:
        - /url: /clinical/help-center
        - img [ref=e33]
        - paragraph [ref=e35]: Help Center
      - link "Settings" [ref=e36] [cursor=pointer]:
        - /url: /clinical/settings
        - img [ref=e37]
        - paragraph [ref=e39]: Settings
    - generic [ref=e40]:
      - generic [ref=e41]:
        - button "Clinical Assistant" [ref=e44]
        - generic [ref=e48]:
          - button "In Progress" [ref=e49] [cursor=pointer]: In Progress
          - button "Completed" [ref=e50] [cursor=pointer]: Completed
          - button "All" [ref=e51] [cursor=pointer]: All
      - contentinfo [ref=e181]:
        - paragraph [ref=e183]: asksam does not provide medical advice, diagnosis, or treatment recommendations. Output must be reviewed by a qualified clinician. asksam is not designed to replace clinical reasoning or provide medical decision guidance.
```