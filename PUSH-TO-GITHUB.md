# Push this project to GitHub

Push the **Job notification Tracker** project to:  
[https://github.com/GOWRISANKAR16/Job-Searching-Platform](https://github.com/GOWRISANKAR16/Job-Searching-Platform)

**Prerequisites:** [Git](https://git-scm.com/download/win) installed. Open **Git Bash** or **PowerShell** in the project folder.

---

## Commands (copy and run in order)

```bash
cd "c:\Users\HP\Desktop\Job notification Tracker"

git init
git remote add origin https://github.com/GOWRISANKAR16/Job-Searching-Platform.git

git add .
git commit -m "Add full Job Notification Tracker - Placement Suite"
git branch -M main
git push -u origin main --force
```

**Note:** Use `git add .` (with a space and then a dot). Do not put the GitHub URL after `git add .`.

If the remote already exists, use: `git remote set-url origin https://github.com/GOWRISANKAR16/Job-Searching-Platform.git` instead of `git remote add origin ...`.

After pushing, your code will be at: **https://github.com/GOWRISANKAR16/Job-Searching-Platform**
