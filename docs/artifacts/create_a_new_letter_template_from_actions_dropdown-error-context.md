# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e4]:
    - button "Open user menu" [ref=e11] [cursor=pointer]:
      - img "CCOP22 TEST's logo" [ref=e14]
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
      - link "Help Center" [ref=e28] [cursor=pointer]:
        - /url: /clinical/help-center
        - img [ref=e29]
        - paragraph [ref=e31]: Help Center
      - link "Settings" [ref=e32] [cursor=pointer]:
        - /url: /clinical/settings
        - img [ref=e33]
        - paragraph [ref=e35]: Settings
    - generic [ref=e36]:
      - generic [ref=e37]:
        - button "Clinical Assistant" [ref=e40]
        - generic [ref=e44]:
          - button "In Progress" [ref=e45] [cursor=pointer]: In Progress
          - button "Completed" [ref=e46] [cursor=pointer]: Completed
          - button "All" [active] [ref=e47] [cursor=pointer]: All
      - contentinfo [ref=e177]:
        - paragraph [ref=e179]: asksam does not provide medical advice, diagnosis, or treatment recommendations. Output must be reviewed by a qualified clinician. asksam is not designed to replace clinical reasoning or provide medical decision guidance.
```