package {{PACKAGE_NAME}}.logic

class TaggingEngine {
    fun autoTag(content: String): List<String> {
        val tags = mutableListOf<String>()
        val lowerContent = content.lowercase()
        
        if (lowerContent.contains("work") || lowerContent.contains("meeting") || lowerContent.contains("job")) {
            tags.add("work")
        }
        if (lowerContent.contains("idea") || lowerContent.contains("concept") || lowerContent.contains("think")) {
            tags.add("idea")
        }
        if (lowerContent.contains("money") || lowerContent.contains("cost") || lowerContent.contains("price") || lowerContent.contains("$") || lowerContent.contains("€")) {
            tags.add("money")
        }
        if (lowerContent.contains("bug") || lowerContent.contains("fix") || lowerContent.contains("error") || lowerContent.contains("crash")) {
            tags.add("bug")
        }
        if (lowerContent.contains("todo") || lowerContent.contains("must") || lowerContent.contains("should")) {
            tags.add("todo")
        }
        
        return tags
    }
}
