package com.jungle.courseshop.controller;

import com.jungle.courseshop.dto.request.TopicRequest;
import com.jungle.courseshop.dto.response.RestResponse;
import com.jungle.courseshop.dto.response.TopicResponse;
import com.jungle.courseshop.repository.TopicRepo;
import com.jungle.courseshop.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class LecturerController {

    TopicService topicService;

    @PostMapping("/topic")
    public ResponseEntity<TopicResponse> createTopic(@RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.create(topic);
        return ResponseEntity.status(HttpStatus.CREATED).body(topicRes);
    }

    @PatchMapping("/topic/{id}")
    public ResponseEntity<TopicResponse> updateTopic(@PathVariable Long id, @RequestBody TopicRequest topic) {
        TopicResponse topicRes = topicService.update(id, topic);
        return ResponseEntity.ok(topicRes);
    }

    @PatchMapping("/topic/delete/{id}")
    public ResponseEntity<?> deleteTopic(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.ok("Topic deleted successfully");
    }

    @GetMapping("/topics")
    public ResponseEntity<RestResponse<List<TopicResponse>>> getAllTopicsByMe() {
        List<TopicResponse> topics = topicService.getTopicsCreatedByCurrentUser();
        RestResponse<List<TopicResponse>> response = new RestResponse<>(HttpStatus.OK.value(), null, "Topics fetched successfully", topics);
        return ResponseEntity.ok(response);
    }

}
