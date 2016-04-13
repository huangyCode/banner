"use strict";
var $__ModuleTransformer_46_js__,
    $__ParseTreeFactory_46_js__,
    $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__,
    $__PlaceholderParser_46_js__,
    $__PrependStatements_46_js__;
var ModuleTransformer = ($__ModuleTransformer_46_js__ = require("./ModuleTransformer.js"), $__ModuleTransformer_46_js__ && $__ModuleTransformer_46_js__.__esModule && $__ModuleTransformer_46_js__ || {default: $__ModuleTransformer_46_js__}).ModuleTransformer;
var $__4 = ($__ParseTreeFactory_46_js__ = require("./ParseTreeFactory.js"), $__ParseTreeFactory_46_js__ && $__ParseTreeFactory_46_js__.__esModule && $__ParseTreeFactory_46_js__ || {default: $__ParseTreeFactory_46_js__}),
    createIdentifierExpression = $__4.createIdentifierExpression,
    createMemberExpression = $__4.createMemberExpression,
    createPropertyNameAssignment = $__4.createPropertyNameAssignment;
var $__5 = ($___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ = require("../syntax/trees/ParseTreeType.js"), $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ && $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__.__esModule && $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__ || {default: $___46__46__47_syntax_47_trees_47_ParseTreeType_46_js__}),
    EXPORT_DEFAULT = $__5.EXPORT_DEFAULT,
    EXPORT_SPECIFIER = $__5.EXPORT_SPECIFIER;
var $__6 = ($__PlaceholderParser_46_js__ = require("./PlaceholderParser.js"), $__PlaceholderParser_46_js__ && $__PlaceholderParser_46_js__.__esModule && $__PlaceholderParser_46_js__ || {default: $__PlaceholderParser_46_js__}),
    parseExpression = $__6.parseExpression,
    parseStatement = $__6.parseStatement,
    parseStatements = $__6.parseStatements;
var prependStatements = ($__PrependStatements_46_js__ = require("./PrependStatements.js"), $__PrependStatements_46_js__ && $__PrependStatements_46_js__.__esModule && $__PrependStatements_46_js__ || {default: $__PrependStatements_46_js__}).prependStatements;
var ClosureModuleTransformer = function($__super) {
  function ClosureModuleTransformer() {
    $traceurRuntime.superConstructor(ClosureModuleTransformer).apply(this, arguments);
  }
  return ($traceurRuntime.createClass)(ClosureModuleTransformer, {
    moduleProlog: function() {
      if (!this.moduleName) {
        throw new Error('Closure modules (goog.module) require a moduleName');
      }
      return parseStatements($traceurRuntime.getTemplateObject(["goog.module(", ");"]), this.moduleName);
    },
    wrapModule: function(statements) {
      if (this.hasStarExports()) {
        throw new Error('Closure modules (goog.module) do not support "export *"');
      }
      return statements;
    },
    appendExportStatement: function(statements) {
      if (!this.hasExports())
        return statements;
      var exportObject = this.getExportObject();
      statements.push(parseStatement($traceurRuntime.getTemplateObject(["exports = ", ""]), exportObject));
      return statements;
    },
    getGetterExport: function($__1) {
      var $__2 = $__1,
          name = $__2.name,
          tree = $__2.tree,
          moduleSpecifier = $__2.moduleSpecifier;
      var expression;
      switch (tree.type) {
        case EXPORT_DEFAULT:
          expression = createIdentifierExpression('$__default');
          break;
        case EXPORT_SPECIFIER:
          if (moduleSpecifier) {
            var idName = this.getTempVarNameForModuleSpecifier(moduleSpecifier);
            expression = createMemberExpression(idName, tree.lhs);
          } else {
            expression = createPropertyNameAssignment(name, tree.lhs);
          }
          break;
        default:
          expression = createIdentifierExpression(name);
          break;
      }
      return createPropertyNameAssignment(name, expression);
    },
    transformModuleSpecifier: function(tree) {
      var moduleName = tree.token.processedValue;
      return parseExpression($traceurRuntime.getTemplateObject(["goog.require(", ")"]), moduleName);
    }
  }, {}, $__super);
}(ModuleTransformer);
Object.defineProperties(module.exports, {
  ClosureModuleTransformer: {get: function() {
      return ClosureModuleTransformer;
    }},
  __esModule: {value: true}
});