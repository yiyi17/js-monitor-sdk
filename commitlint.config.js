module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['merge', 'feat', 'ci', 'fix', 'refactor', 'docs', 'chore', 'style', 'revert']
    ],
    'subject-case': [2, 'never', ['upper-case']],
    'type-case': [0],
    'type-empty': [0],
    'subject-empty': [0]
  }
};

// <commit-type> 常见为：

// chore：构建配置相关。
// docs：文档相关。
// feat：添加新功能。
// fix：修复 bug。
// pref：性能相关。
// refactor：代码重构，一般如果不是其他类型的 commit，都可以归为重构。
// revert：分支回溯。
// style：样式相关。
// test：测试相关。

// [(commit-scope)] 可选，表示范围，例如：refactor(cli)，表示关于 cli 部分的代码重构。
// <commit-message> 提交记录的信息，有些规范可能会要求首字母大写。
// <commit-icon> 用图标来替代 <commit-type> 所表示的功能。
