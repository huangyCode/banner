"use strict";
var $__ParseTreeTransformer_46_js__,
    $___46__46__47_syntax_47_trees_47_ParseTrees_46_js__,
    $__ParseTreeFactory_46_js__,
    $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__,
    $___46__46__47_syntax_47_TokenType_46_js__;
var ParseTreeTransformer = ($__ParseTreeTransformer_46_js__ = require("./ParseTreeTransformer.js"), $__ParseTreeTransformer_46_js__ && $__ParseTreeTransformer_46_js__.__esModule && $__ParseTreeTransformer_46_js__ || {default: $__ParseTreeTransformer_46_js__}).ParseTreeTransformer;
var $__2 = ($___46__46__47_syntax_47_trees_47_ParseTrees_46_js__ = require("../syntax/trees/ParseTrees.js"), $___46__46__47_syntax_47_trees_47_ParseTrees_46_js__ && $___46__46__47_syntax_47_trees_47_ParseTrees_46_js__.__esModule && $___46__46__47_syntax_47_trees_47_ParseTrees_46_js__ || {default: $___46__46__47_syntax_47_trees_47_ParseTrees_46_js__}),
    ArgumentList = $__2.ArgumentList,
    BinaryExpression = $__2.BinaryExpression,
    CallExpression = $__2.CallExpression,
    ConditionalExpression = $__2.ConditionalExpression,
    MemberExpression = $__2.MemberExpression,
    MemberLookupExpression = $__2.MemberLookupExpression;
var $__3 = ($__ParseTreeFactory_46_js__ = require("./ParseTreeFactory.js"), $__ParseTreeFactory_46_js__ && $__ParseTreeFactory_46_js__.__esModule && $__ParseTreeFactory_46_js__ || {default: $__ParseTreeFactory_46_js__}),
    createArrayLiteral = $__3.createArrayLiteral,
    createAssignmentExpression = $__3.createAssignmentExpression,
    createCommaExpression = $__3.createCommaExpression,
    createMemberExpression = $__3.createMemberExpression,
    id = $__3.createIdentifierExpression,
    createNullLiteral = $__3.createNullLiteral,
    createParenExpression = $__3.createParenExpression;
var $__4 = ($___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ = require("../syntax/trees/ParseTreeType.js"), $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ && $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__.__esModule && $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ || {default: $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__}),
    COMMA_EXPRESSION = $__4.COMMA_EXPRESSION,
    MEMBER_EXPRESSION = $__4.MEMBER_EXPRESSION,
    MEMBER_LOOKUP_EXPRESSION = $__4.MEMBER_LOOKUP_EXPRESSION,
    IDENTIFIER_EXPRESSION = $__4.IDENTIFIER_EXPRESSION,
    PAREN_EXPRESSION = $__4.PAREN_EXPRESSION,
    THIS_EXPRESSION = $__4.THIS_EXPRESSION;
var $__5 = ($___46__46__47_syntax_47_TokenType_46_js__ = require("../syntax/TokenType.js"), $___46__46__47_syntax_47_TokenType_46_js__ && $___46__46__47_syntax_47_TokenType_46_js__.__esModule && $___46__46__47_syntax_47_TokenType_46_js__ || {default: $___46__46__47_syntax_47_TokenType_46_js__}),
    AND = $__5.AND,
    OR = $__5.OR;
function createCall(tree, operand, thisArg) {
  var argList = tree.args;
  var argArray = argList ? argList.args : [];
  argArray = argArray.map(function(arg) {
    if (arg.type === COMMA_EXPRESSION) {
      return createParenExpression(arg.type);
    }
    return arg;
  });
  return new CallExpression(tree.location, createMemberExpression('$traceurRuntime', 'continuation'), new ArgumentList(argList ? argList.location : null, [operand, thisArg, createArrayLiteral(argArray)]));
}
var RewriteTailExpressionsTransformer = function($__super) {
  function RewriteTailExpressionsTransformer(bodyTransformer) {
    $traceurRuntime.superConstructor(RewriteTailExpressionsTransformer).call(this);
    this.bodyTransformer_ = bodyTransformer;
  }
  return ($traceurRuntime.createClass)(RewriteTailExpressionsTransformer, {
    transformBinaryExpression: function(tree) {
      var operator = tree.operator;
      if (operator.type !== AND && operator.type !== OR) {
        return tree;
      }
      var right = this.transformAny(tree.right);
      if (right !== tree.right) {
        return new BinaryExpression(tree.location, tree.left, operator, right);
      }
      return tree;
    },
    transformCallExpression: function(tree) {
      var operand = tree.operand;
      while (operand.type === PAREN_EXPRESSION) {
        operand = operand.expression;
      }
      switch (operand.type) {
        case IDENTIFIER_EXPRESSION:
          return createCall(tree, operand, createNullLiteral());
        case MEMBER_EXPRESSION:
        case MEMBER_LOOKUP_EXPRESSION:
          return this.transformMemberExpressionCall_(tree, operand);
      }
      return tree;
    },
    transformMemberExpressionCall_: function(tree, operand) {
      var object = operand.operand;
      var thisArg;
      var assignment;
      if (object.type === IDENTIFIER_EXPRESSION || object.type === THIS_EXPRESSION) {
        thisArg = object;
      } else {
        thisArg = id(this.bodyTransformer_.addTempVar());
        assignment = createAssignmentExpression(thisArg, operand.operand);
      }
      if (operand.type === MEMBER_EXPRESSION) {
        operand = new MemberExpression(operand.location, thisArg, operand.memberName);
      } else {
        operand = new MemberLookupExpression(operand.location, thisArg, operand.memberExpression);
      }
      if (assignment) {
        return createParenExpression(createCommaExpression([assignment, createCall(tree, operand, thisArg)]));
      } else {
        return createCall(tree, operand, thisArg);
      }
    },
    transformCommaExpression: function(tree) {
      var expressions = tree.expressions;
      var expression = expressions[expressions.length - 1];
      var transformedExpression = this.transformAny(expression);
      if (expression !== transformedExpression) {
        expressions = expressions.slice(0, -1);
        expressions.push(transformedExpression);
        return new CommaExpression(tree.location, expressions);
      }
      return tree;
    },
    transformConditionalExpression: function(tree) {
      var left = this.transformAny(tree.left);
      var right = this.transformAny(tree.right);
      if (left !== tree.left || right !== tree.right) {
        return new ConditionalExpression(tree.location, tree.condition, left, right);
      }
      return tree;
    },
    transformNewExpression: function(tree) {
      return createCall(tree, createMemberExpression('$traceurRuntime', 'construct'), tree.operand);
    },
    transformArrayLiteral: function(tree) {
      return tree;
    },
    transformArrowFunction: function(tree) {
      return tree;
    },
    transformFunctionExpression: function(tree) {
      return tree;
    },
    transformIdentifierExpression: function(tree) {
      return tree;
    },
    transformLiteralExpression: function(tree) {
      return tree;
    },
    transformMemberExpression: function(tree) {
      return tree;
    },
    transformMemberLookupExpression: function(tree) {
      return tree;
    },
    transformPostfixExpression: function(tree) {
      return tree;
    },
    transformObjectLiteral: function(tree) {
      return tree;
    },
    transformUnaryExpression: function(tree) {
      return tree;
    }
  }, {transform: function(bodyTransformer, tree) {
      return new RewriteTailExpressionsTransformer(bodyTransformer).transformAny(tree);
    }}, $__super);
}(ParseTreeTransformer);
Object.defineProperties(module.exports, {
  RewriteTailExpressionsTransformer: {get: function() {
      return RewriteTailExpressionsTransformer;
    }},
  __esModule: {value: true}
});