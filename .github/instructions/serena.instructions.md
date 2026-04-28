---
description: Rules for always using Serena MCP tools for code exploration and editing
applyTo: "**"
---

# Serena MCP Tools — Always Use

## CRITICAL: For ALL code exploration and editing tasks

You MUST use Serena MCP tools as the PRIMARY approach for all coding tasks in this workspace.

### Before exploring code

- Use `mcp_oraios_serena_get_symbols_overview` to understand file structure instead of reading entire files
- Use `mcp_oraios_serena_find_symbol` with `include_body=false` first to discover symbols, then `include_body=true` only for what you need
- Use `mcp_oraios_serena_search_for_pattern` to find code patterns before falling back to `grep_search`
- Use `mcp_oraios_serena_find_referencing_symbols` to understand symbol relationships

### Before editing code

- Use `mcp_oraios_serena_replace_symbol_body` when replacing an entire function, method, or class
- Use `mcp_oraios_serena_replace_content` for partial edits within a symbol (regex-based)
- Use `mcp_oraios_serena_insert_after_symbol` / `mcp_oraios_serena_insert_before_symbol` for adding new code

### Loading Serena tools

- Serena tools are deferred. ALWAYS call `tool_search_tool_regex` with pattern `mcp_oraios_serena` at the START of any non-trivial task to ensure they are loaded and available.

### Fallback

- Only use standard tools (`read_file`, `replace_string_in_file`, etc.) when Serena tools cannot accomplish the task (e.g., reading non-code files, binary files, or very small single-line edits where symbol targeting is overkill).
