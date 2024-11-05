---
title: Task Tracking
date: Nov 4, 2024
description: Why isn't there a good task tracking tool?
---

There are so many task tracking apps out there. Why isn't there a good one?
They usually focus on projects, estimations, tags, and other organizational
overhead. Tasks themselves are relegated to a few quick lines of text.
I think this is because many of these are meant for general project management
and people who need all of there information within an app.

The thing with working in plain text all the time is, your file system becomes a
project separation tool.

For the longest time, I used [org-mode](https://orgmode.org/). It's great for
almost everything I needed. Org capture allows you to run the `org-capture`
command and quickly add a task to your inbox from anywhere. The killer feature
for me [location linking](https://orgmode.org/manual/Capture-templates.html).

> During expansion of the template, `%a` has been replaced by a link to the
> location from where you called the capture command.

Allowing a quick way to open the exact context which prompted the task is
invaluable. Of course, this only really works because org-mode is in Emacs along
with just about everything else. I had my email, calendar, code, and tasks all
within Emacs. But, in the end I found that I was spending too much time
configuring and fixing Emacs and not enough actually doing work. Not to mention
the LSP for languages like Typescript and Rust were just painfully slow.

I'll never fully leave Emacs. Proof General is still essential for me since I
use it to interact with [Adelfa](https://adelfa-prover.org).[^1]

I've moved on to VSCode for all of my work. When it comes to task tracking, the
best I could find was
[Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-todo-plus)
in conjunction with
[Projects+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus)
and [Projects+
Todo+](https://marketplace.visualstudio.com/items?itemName=fabiospampinato.vscode-projects-plus-todo-plus).
The latter was actually broken for me, but I fixed them in [a fork
here](https://github.com/cjohnson19/vscode-projects-plus-todo-plus).

I'm desperate for the ability to link to specific locations in files. Once I'm
done with some of my current research projects, I'll probably look to build
something which does this. Maybe there's a limitation in VSCode which doesn't
support opening arbitrary files, but I'm not sure what it is yet.

[^1]: I'm working on an Adelfa VSCode extension to hopefully move away from
    Proof General. I'll keep supporting that method for those users which like
    PG, but I see more and more developers migrating to VSCode. I want to
    provide them an easy on-ramp to using Adelfa.